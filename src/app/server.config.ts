
export const SERVER = (function () {
    const BASE_URL = 'https://undp-admin.carto.com/api/v2';
    const API_KEY = '&api_key=e8c2ad6fa1cf884aa2287ff7a5f9ea5030224eab';
    return {
        BASE_URL: BASE_URL,
        GET_QUERY: function (sql) {
            return `${BASE_URL}/sql?q=${sql}${API_KEY}`;
        }
    };
})();
