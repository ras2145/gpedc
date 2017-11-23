
export const SERVER = (function () {
    const USERNAME = 'undp-admin';
    const CARTO_TOKEN = 'e8c2ad6fa1cf884aa2287ff7a5f9ea5030224eab';
    const API_KEY = `&api_key=${CARTO_TOKEN}`;
    const FORMAT = '&format=GeoJSON';
    const BASE_URL = `https://${USERNAME}.carto.com/api/v2`;
    const COUNTRY_TABLE = 'undp_countries_copy';
    const PARTNER_TABLE = 'undp_partners_copy';
    const COLUMS_OF_COUNTRIES = '_2016_1_2,iso3_code,status,country,_2016,_2014,region,inc_group,ldc,sids,background,profile,_2014_5a,_2014_5b,_2014_6,_2014_7,_2014_7_1,_2014_7_2,_2014_7_3,_2014_7_4,_2014_7_5,_2014_8,_2014_8_1,_2014_8_2,_2014_8_3,_2014_8_4,_2014_9a,_2014_9b,_2014_10,_2016_1_1,cartodb_id,_2016_1_3,_2016_1_4,_2016_2_1,_2016_2_2,_2016_2_3,_2016_2_4,_2016_3_1,_2016_3_2,_2016_3_3,_2016_3_4,_2016_4_1,_2016_4_2,_2016_4_3,_2016_5a,_2016_5b,_2016_6,_2016_7,_2016_7_1,_2016_7_2,_2016_7_3,_2016_7_4,_2016_7_5,_2016_8,_2016_8_1,_2016_8_2,_2016_8_3,_2016_8_4,_2016_9a,_2016_9b,_2016_10';
    return {
        COLUMS_OF_COUNTRIES: COLUMS_OF_COUNTRIES,
        API_KEY: API_KEY,
        BASE_URL: BASE_URL,
        CARTO_TOKEN: CARTO_TOKEN,
        COUNTRY_TABLE: COUNTRY_TABLE,
        PARTNER_TABLE: PARTNER_TABLE,
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
