import json
import os

# from datetime import datetime
from typing import Any
from typing import Dict
from typing import List

import requests
from dotenv import load_dotenv

from app.models.tasting import Tasting
from app.models.whiskey import Whiskey

# from typing import Optional


# Load API keys from .env file
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def search_whiskey_info(query: str) -> Dict[str, Any]:
    """Search for information about a whiskey using the OpenAI API"""
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
                    "content": """
                אתה מומחה ויסקי שמספק מידע מדויק על סוגי ויסקי ומזקקות.
                יש להפריד בין מידע על מזקקה למידע על ויסקי ספציפי.
                לתת מידע מפורט על האזור, חוויית הטעימה ופרטי ייצור.
                להוסיף עובדות מעניינות שעשויות להיות רלוונטיות לאוסף הוויסקי.
                """,
                },
                {
                    "role": "user",
                    "content": f"""
                ספק לי מידע מפורט על הוויסקי או המזקקה: {query}
                אם מדובר בויסקי ספציפי:
                - שם המזקקה
                - אזור, מדינה
                - תהליך הייצור והיישון
                - פרופיל טעם (אף/חיך/סיומת)
                - עובדות מעניינות

                אם מדובר במזקקה:
                - שם מלא
                - אזור, מדינה
                - היסטוריה
                - סוגי הוויסקי האופייניים
                - עובדות מעניינות

                השתמש בעברית בלבד.
                """,
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

        # Parse the content to structured data
        # This is a basic implementation; could be improved with better parsing
        result_data = {"name": query, "description": content, "exists": True}

        # Try to determine if it's a distillery or a whiskey
        is_distillery = "מזקקה" in content[:200].lower() and "סיומת" not in content

        result_data["is_distillery"] = is_distillery

        # Extract some fields based on typical patterns
        import re

        if not is_distillery:
            # Try to extract distillery
            distillery_match = re.search(r"מזקקה: ([^\n.]+)", content)
            if distillery_match:
                result_data["distillery"] = distillery_match.group(1).strip()

            # Try to extract region and country
            region_match = re.search(r"אזור: ([^\n.]+)", content)
            if region_match:
                result_data["region"] = region_match.group(1).strip()

            country_match = re.search(r"מדינה: ([^\n.]+)", content) or re.search(
                r"מיוצר ב([^\n.]+)", content
            )
            if country_match:
                result_data["country"] = country_match.group(1).strip()

            # Extract flavor profiles
            nose_match = re.search(r"אף: ([^\n.]+)", content) or re.search(
                r"בעיפרון: ([^\n.]+)", content
            )
            palate_match = re.search(r"חיך: ([^\n.]+)", content) or re.search(
                r"בטעימה: ([^\n.]+)", content
            )
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
            # It's a distillery
            region_match = re.search(r"אזור: ([^\n.]+)", content)
            if region_match:
                result_data["region"] = region_match.group(1).strip()

            country_match = re.search(r"מדינה: ([^\n.]+)", content)
            if country_match:
                result_data["country"] = country_match.group(1).strip()

        # Extract facts
        facts = []
        facts_section = re.search(r"עובדות מעניינות:?([\s\S]+?)($|(?=##))", content)
        if facts_section:
            facts_text = facts_section.group(1)
            # Try to split by bullet points or numbers
            fact_items = re.findall(r"[-•*]\s*([^\n]+)", facts_text)
            if fact_items:
                facts = [item.strip() for item in fact_items]
            else:
                # Split by newlines if no bullet points
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
            "error_message": "לא הצלחנו למצוא מידע על הויסקי המבוקש",
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

        # Prepare data for analysis
        whiskey_types = [w.type for w in whiskeys if w.type]
        whiskey_regions = [w.region for w in whiskeys if w.region]

        # Calculate average rating
        avg_rating = 0
        if tastings:
            avg_rating = sum(t.rating for t in tastings) / len(tastings)

        # Find top rated whiskeys
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
        top_whiskeys = top_whiskeys[:3]  # Take top 3

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
                    "content": """
                אתה מומחה ויסקי המנתח אוספים ומספק תובנות אישיות.
                התשובה שלך צריכה לכלול:
                1. ניתוח של העדפות טעם של המשתמש על בסיס האוסף שלו
                2. שלושה ויסקי מומלצים ספציפיים על בסיס העדפות המשתמש
                3. הצעות לאזורים או סגנונות חדשים לחקור

                הקפד לספק המלצות מדויקות ומנומקות.
                """,
                },
                {
                    "role": "user",
                    "content": f"""
                נתח את אוסף הוויסקי הבא וספק תובנות והמלצות:

                מספר ויסקי באוסף: {len(whiskeys)}
                סוגי ויסקי באוסף: {', '.join(set(whiskey_types))
                                   if whiskey_types else "אין מידע"}
                אזורים באוסף: {', '.join(set(whiskey_regions))
                               if whiskey_regions else "אין מידע"}
                ויסקי מדורגים בראש: {', '.join(top_whiskeys_info)
                                     if top_whiskeys_info else "אין דירוגים"}
                דירוג ממוצע: {round(avg_rating, 1)}/10
                """,
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

        # Parse the JSON response
        try:
            analysis = json.loads(content)

            # Make sure we have the expected structure
            if not isinstance(analysis, dict):
                analysis = {
                    "taste_preferences": "לא ניתן היה לנתח את העדפות הטעם",
                    "recommendations": [],
                    "exploration_suggestions": "לא ניתן היה לייצר המלצות",
                }

            # Make sure recommendations is a list
            if "recommendations" not in analysis or not isinstance(
                analysis["recommendations"], list
            ):
                analysis["recommendations"] = []

            # Format the recommendations if needed
            formatted_recs = []
            for rec in analysis.get("recommendations", []):
                if isinstance(rec, str):
                    formatted_recs.append({"name": rec, "reason": ""})
                elif isinstance(rec, dict) and "name" in rec:
                    formatted_recs.append(rec)

            analysis["recommendations"] = formatted_recs

            return analysis

        except json.JSONDecodeError:
            # Fallback if we can't parse the JSON
            return {
                "analysis": content,
                "recommendations": [],
                "taste_preferences": "ניתוח לא מובנה",
                "exploration_suggestions": "ניתוח לא מובנה",
            }

    except Exception as e:
        print(f"Error analyzing collection: {e}")
        return {
            "taste_preferences": "לא הצלחנו לנתח את העדפות הטעם שלך כרגע",
            "recommendations": [],
            "exploration_suggestions": "נסה שוב מאוחר יותר",
        }


def recommend_whiskey(
    whiskeys: List[Whiskey], tastings: List[Tasting]
) -> Dict[str, Any]:
    """Generate a random whiskey recommendation"""
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
                    "content": """
                אתה מומחה ויסקי שנותן המלצות מעמיקות ומדויקות.
                המלץ על ויסקי איכותי ומעניין בפורמט מובנה שיכלול:
                - שם הויסקי
                - מזקקה
                - אזור ומדינה
                - סוג (סינגל מאלט, בלנדד, בורבון וכו')
                - גיל או שנת יישון
                - אחוז אלכוהול
                - פרופיל טעם (ריח/טעם/סיומת)
                - תיאור כללי
                - מה מיוחד בו
                - טווח מחירים

                הקפד לבחור ויסקי איכותי ומעניין שיוכל להוסיף ערך לאוסף.
                """,
                },
                {
                    "role": "user",
                    "content": """
                המלץ לי על ויסקי מעניין ואיכותי שלא נמצא באוסף שלי.
                אני מחפש המלצה לויסקי ייחודי עם סיפור או מאפיינים מעניינים במיוחד.
                """,
                },
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.9,  # Higher temperature for variety
        }

        response = requests.post(
            "https://api.openai.com/v1/chat/completions", headers=headers, json=data
        )
        response.raise_for_status()

        result = response.json()
        content = result["choices"][0]["message"]["content"]

        # Parse the JSON response
        try:
            recommendation = json.loads(content)
            return recommendation
        except json.JSONDecodeError:
            # Fallback if we can't parse the JSON
            return {"name": "המלצת ויסקי", "description": content}

    except Exception as e:
        print(f"Error generating recommendation: {e}")
        return {
            "name": "שגיאה בהמלצה",
            "description": "לא הצלחנו לייצר המלצה כרגע, נסה שוב מאוחר יותר.",
        }
