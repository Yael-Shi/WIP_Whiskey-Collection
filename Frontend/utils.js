// export function createPageUrl(pageName, params = {}) {
//     let url = `/${pageName}`; // Assuming page names map directly to routes
//     const queryParams = new URLSearchParams();

//     // Handle cases where pageName might include query string already
//     if (pageName.includes('?')) {
//       const [basePageName, queryString] = pageName.split('?', 2);
//       url = `/${basePageName}`;
//       const existingParams = new URLSearchParams(queryString);
//       existingParams.forEach((value, key) => queryParams.set(key, value));
//     }

//     for (const key in params) {
//       if (Object.prototype.hasOwnProperty.call(params, key)) {
//         queryParams.set(key, params[key]);
//       }
//     }

//     const queryString = queryParams.toString();
//     return queryString ? `${url}?${queryString}` : url;
//   }
