import json
import os
from typing import Any
from typing import Dict
from typing import List

import requests
from dotenv import load_dotenv

from app.models.tasting import Tasting
from app.models.whiskey import Whiskey

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def search_whiskey_info(query: str) -> Dict[str, Any]:
    """Search for information about a whiskey or distillery using the OpenAI API"""
    try:
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }

        data = {
            "model": "gpt-4",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "אתה מומחה ויסקי שמספק מידע מדויק על סוגי ויסקי ומזקקות.\n"
                        "יש להפריד בין מידע על מזקקה למידע על ויסקי ספציפי.\n"
                        "לתת מידע מפורט על האזור, חוויית הטעימה ופרטי ייצור.\n"
                        "להוסיף עובדות מעניינות שעשויות להיות רלוונטיות לאוסף הוויסקי."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"ספק לי מידע מפורט על הוויסקי או המזקקה: {query}\n"
                        "אם מדובר בויסקי ספציפי:\n"
                        "- שם המזקקה\n"
                        "- אזור, מדינה\n"
                        "- תהליך הייצור והיישון\n"
                        "- פרופיל טעם (אף/חיך/סיומת)\n"
                        "- עובדות מעניינות\n\n"
                        "אם מדובר במזקקה:\n"
                        "- שם מלא\n"
                        "- אזור, מדינה\n"
                        "- היסטוריה\n"
                        "- סוגי הוויסקי האופייניים\n"
                        "- עובדות מעניינות\n\n"
                        "השתמש בעברית בלבד."
                    ),
                },
            ],
            "temperature": 0.7,
        }

        response = requests.post(
            "https://api.openai.com/v1/chat/completions", headers=headers, json=data
        )
        response.raise_for_status()

        result = response.json()
        content = result["choices"][0]["message"]["content"]

        result_data = {"name": query, "description": content, "exists": True}

        is_distillery = "מזקקה" in content[:200].lower() and "סיומת" not in content
        result_data["is_distillery"] = is_distillery

        import re

        if not is_distillery:
            distillery_match = re.search(r"מזקקה: ([^\n.]+)", content)
            if distillery_match:
                result_data["distillery"] = distillery_match.group(1).strip()

            region_match = re.search(r"אזור: ([^\n.]+)", content)
            if region_match:
                result_data["region"] = region_match.group(1).strip()

            country_match = re.search(r"מדינה: ([^\n.]+)", content) or re.search(
                r"מיוצר ב([^\n.]+)", content
            )
            if country_match:
                result_data["country"] = country_match.group(1).strip()

            nose_match = re.search(r"אף: ([^\n.]+)", content)
            palate_match = re.search(r"חיך: ([^\n.]+)", content)
            finish_match = re.search(r"סיומת: ([^\n.]+)", content)

            taste_profile = {}
            if nose_match:
                taste_profile["nose"] = nose_match.group(1).strip()
            if palate_match:
                taste_profile["palate"] = palate_match.group(1).strip()
            if finish_match:
                taste_profile["finish"] = finish_match.group(1).strip()

            if taste_profile:
                result_data["taste_profile"] = taste_profile

        else:
            region_match = re.search(r"אזור: ([^\n.]+)", content)
            if region_match:
                result_data["region"] = region_match.group(1).strip()

            country_match = re.search(r"מדינה: ([^\n.]+)", content)
            if country_match:
                result_data["country"] = country_match.group(1).strip()

        facts = []
        facts_section = re.search(r"עובדות מעניינות:?([\s\S]+?)($|(?=##))", content)
        if facts_section:
            facts_text = facts_section.group(1)
            fact_items = re.findall(r"[-•*]\s*([^\n]+)", facts_text)
            if fact_items:
                facts = [item.strip() for item in fact_items]
            else:
                fact_items = [
                    line.strip() for line in facts_text.split("\n") if line.strip()
                ]
                if fact_items:
                    facts = fact_items

        if facts:
            result_data["interesting_facts"] = facts

        return result_data

    except Exception as e:
        print(f"Error in AI service: {e}")
        return {
            "exists": False,
            "error_message": "לא הצלחנו למצוא מידע על הוויסקי המבוקש",
        }


def analyze_collection(
    whiskeys: List[Whiskey], tastings: List[Tasting]
) -> Dict[str, Any]:
    """Analyze a user's whiskey collection and tastings"""
    try:
        if not whiskeys:
            return {
                "analysis": "אין מספיק נתונים לניתוח - "
                "הוסף ויסקי לאוסף שלך כדי לקבל תובנות.",
                "recommendations": [],
                "taste_preferences": "לא זוהו העדפות עדיין",
                "exploration_suggestions": "התחל באיסוף ויסקי כדי לקבל המלצות",
            }

        whiskey_types = [w.type for w in whiskeys if w.type]
        whiskey_regions = [w.region for w in whiskeys if w.region]

        avg_rating = 0.0
        if tastings:
            avg_rating = sum(t.rating for t in tastings) / len(tastings)

        whiskey_ratings = {}
        for tasting in tastings:
            if tasting.whiskey_id not in whiskey_ratings:
                whiskey_ratings[tasting.whiskey_id] = {"sum": 0, "count": 0}
            whiskey_ratings[tasting.whiskey_id]["sum"] += tasting.rating
            whiskey_ratings[tasting.whiskey_id]["count"] += 1

        top_whiskeys = []
        for whiskey in whiskeys:
            if (
                whiskey.id in whiskey_ratings
                and whiskey_ratings[whiskey.id]["count"] > 0
            ):
                avg = (
                    whiskey_ratings[whiskey.id]["sum"]
                    / whiskey_ratings[whiskey.id]["count"]
                )
                top_whiskeys.append((whiskey, avg))

        top_whiskeys.sort(key=lambda x: x[1], reverse=True)
        top_whiskeys = top_whiskeys[:3]

        top_whiskeys_info = [
            f"{w.name} ({round(rating, 1)}/10)" for w, rating in top_whiskeys
        ]

        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }

        data = {
            "model": "gpt-4",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "אתה מומחה ויסקי המנתח אוספים ומספק תובנות אישיות.\n"
                        "התשובה שלך צריכה לכלול:\n"
                        "1. ניתוח של העדפות טעם של המשתמש על בסיס האוסף שלו\n"
                        "2. שלושה ויסקי מומלצים ספציפיים על בסיס העדפות המשתמש\n"
                        "3. הצעות לאזורים או סגנונות חדשים לחקור\n"
                        "הקפד לספק המלצות מדויקות ומנומקות."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"נתח את אוסף הוויסקי הבא וספק תובנות והמלצות:\n\n"
                        f"מספר ויסקי באוסף: {len(whiskeys)}\n"
                        f"סוגי ויסקי באוסף: {', '.join(set(whiskey_types)) if
                                             whiskey_types else 'אין מידע'}\n"
                        f"אזורים באוסף: {', '.join(set(whiskey_regions)) if
                                         whiskey_regions else 'אין מידע'}\n"
                        f"ויסקי מדורגים בראש: {', '.join(top_whiskeys_info) if
                                               top_whiskeys_info else 'אין דירוגים'}\n"
                        f"דירוג ממוצע: {round(avg_rating, 1)}/10"
                    ),
                },
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.7,
        }

        response = requests.post(
            "https://api.openai.com/v1/chat/completions", headers=headers, json=data
        )
        response.raise_for_status()

        result = response.json()
        content = result["choices"][0]["message"]["content"]

        try:
            analysis = json.loads(content)
            if not isinstance(analysis, dict):
                analysis = {
                    "taste_preferences": "לא ניתן היה לנתח את העדפות הטעם",
                    "recommendations": [],
                    "exploration_suggestions": "לא ניתן היה לייצר המלצות",
                }

            if "recommendations" not in analysis or not isinstance(
                analysis["recommendations"], list
            ):
                analysis["recommendations"] = []

            formatted_recs = []
            for rec in analysis.get("recommendations", []):
                if isinstance(rec, str):
                    formatted_recs.append({"name": rec})
                elif isinstance(rec, dict) and "name" in rec:
                    formatted_recs.append(rec)
            analysis["recommendations"] = formatted_recs

            return analysis
        except Exception as parse_error:
            print(f"Error parsing analysis response: {parse_error}")
            return {
                "taste_preferences": content,
                "recommendations": [],
                "exploration_suggestions": "לא ניתן היה לייצר המלצות",
            }

    except Exception as e:
        print(f"Error in analyze_collection: {e}")
        return {
            "taste_preferences": "אירעה שגיאה בניתוח האוסף",
            "recommendations": [],
            "exploration_suggestions": "אנא נסה שוב מאוחר יותר",
        }
