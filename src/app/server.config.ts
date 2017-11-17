
export const SERVER = (function () {
    const USERNAME = 'undp-admin';
    const CARTO_TOKEN = 'e8c2ad6fa1cf884aa2287ff7a5f9ea5030224eab';
    const API_KEY = `&api_key=${CARTO_TOKEN}`;
    const FORMAT = '&format=GeoJSON';
    const BASE_URL = `https://${USERNAME}.carto.com/api/v2`;
    const COUNTRY_TABLE = 'undp_countries_copy';
    return {
        API_KEY: API_KEY,
        BASE_URL: BASE_URL,
        CARTO_TOKEN: CARTO_TOKEN,
        COUNTRY_TABLE: COUNTRY_TABLE,
        GET_QUERY: function (sql, geojson?: boolean) {
            let url = `${BASE_URL}/sql?q=${sql}${API_KEY}`;
            if (geojson) {
                url = url + FORMAT;
            }
            return url;
        },
        USERNAME: USERNAME
    };
})();
