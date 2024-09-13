/**
 * @name
 *      Mapbiomas User Toolkit Download
 * 
 * @description
 *      This is a support tool for mapbiomas data users.
 *  
 * @author
 *      João Siqueira
 *      contato@mapbiomas.org
 *
 * @version
 *    1.0.0 - Data from collection 5.0
 *    1.1.0 - Data from collection 6.0
 *    1.2.0 - Data from collection 7.0
 *    1.3.0 - Data from collection 7.1
 *    1.4.0 - Data from collection 8.0
 *    1.5.0 - Data from collection 9.0
 * 
 * @see
 *      Get the MapBiomas exported data in your "Google Drive/MAPBIOMAS-EXPORT" folder
 *      Code and Tutorial - https://github.com/mapbiomas-brazil/user-toolkit
 */

var palettes = require('users/mapbiomas/modules:Palettes.js');
var mapp = require('users/joaovsiqueira1/packages:Mapp.js');
var legend = require('users/joaovsiqueira1/packages:Legend.js');

/**
 * @description
 *    calculate area for mapbiomas map
 * 
 * @author
 *    João Siqueira
 * 
 */
var Area = {

    /**
     * Convert a complex obj to feature collection
     * @param obj 
     */
    convert2table: function (obj) {

        obj = ee.Dictionary(obj);

        var classesAndAreas = ee.List(obj.get('groups'));

        var tableRows = classesAndAreas.map(
            function (classAndArea) {
                classAndArea = ee.Dictionary(classAndArea);

                var classId = classAndArea.get('class');
                var area = classAndArea.get('sum');

                var tableColumns = ee.Feature(null)
                    .set('class', classId)
                    .set('area', area);

                return tableColumns;
            }
        );

        return ee.FeatureCollection(ee.List(tableRows));
    },

    /**
     * Calculate area crossing a cover map (deforestation, mapbiomas)
     * and a region map (states, biomes, municipalites)
     * @param image 
     * @param territory 
     * @param geometry
     * @param scale
     * @param factor
     */
    calculate: function (object) {

        var reducer = ee.Reducer.sum().group(1, 'class').group(1, 'territory');
        var pixelArea = ee.Image.pixelArea().divide(object.factor);

        var territotiesData = pixelArea.addBands(object.territory).addBands(object.image)
            .reduceRegion({
                reducer: reducer,
                geometry: object.geometry,
                scale: object.scale,
                maxPixels: 1e13
            });

        territotiesData = ee.List(territotiesData.get('groups'));

        var areas = territotiesData.map(Area.convert2table);

        areas = ee.FeatureCollection(areas).flatten()
            .map(
                function (feature) {
                    return feature.set("unit", object.unit);
                }
            );

        return areas;
    }

};

/**
 * 
 */
var App = {

    options: {

        version: '1.5.0',

        logo: {
            uri: 'gs://mapbiomas-public/mapbiomas-logos/mapbiomas-logo-horizontal.b64',
            base64: null
        },

        statesNames: {
            'None': 'None',
            'Acre': '12',
            'Alagoas': '27',
            'Amazonas': '13',
            'Amapá': '16',
            'Bahia': '29',
            'Ceará': '23',
            'Distrito Federal': '53',
            'Espírito Santo': '32',
            'Goiás': '52',
            'Maranhão': '21',
            'Minas Gerais': '31',
            'Mato Grosso do Sul': '50',
            'Mato Grosso': '51',
            'Pará': '15',
            'Paraíba': '25',
            'Pernambuco': '26',
            'Piauí': '22',
            'Paraná': '41',
            'Rio de Janeiro': '33',
            'Rio Grande do Norte': '24',
            'Rondônia': '11',
            'Roraima': '14',
            'Rio Grande do Sul': '43',
            'Santa Catarina': '42',
            'Sergipe': '28',
            'São Paulo': '35',
            'Tocantins': '17'
        },

        tables: {
            'mapbiomas-brazil': [
                {
                    'label': 'Amacro',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/AMACRO',
                },
                {
                    'label': 'Ministry of the Environment priority areas 2018',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/AREAS_PRIORITARIAS_DO_MMA_2018',
                },
                {
                    'label': 'Atlantic Forest Law',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/ATLANTIC_FOREST_LAW',
                },
                {
                    'label': 'Basin Level 1 DNAEE',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/BASIN_LEVEL_1_DNAEE',
                },
                {
                    'label': 'Basin Level 1 PNRH',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/BASIN_LEVEL_1_PNRH',
                },
                {
                    'label': 'Basin Level 2 DNAEE',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/BASIN_LEVEL_2_DNAEE',
                },
                {
                    'label': 'Basin Level 2 PNRH',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/BASIN_LEVEL_2_PNRH',
                },
                {
                    'label': 'Biomes',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/BIOMES',
                },
                {
                    'label': 'Coastal Marine Zone',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/COASTAL_MARINE_ZONE',
                },
                {
                    'label': 'Forest Concessions',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/CONCESSOES_FLORESTAIS',
                },
                {
                    'label': 'DHN250 Level 1',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/DHN250_LEVEL_1',
                },
                {
                    'label': 'DHN250 Level 2',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/DHN250_LEVEL_2',
                },
                {
                    'label': 'DHN250 Level 3',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/DHN250_LEVEL_3',
                },
                {
                    'label': 'Non-Designated Public Forests',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/FLORESTAS_PUBLICAS_NAO_DESTINADAS',
                },
                {
                    'label': 'Geoparques',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/GEOPARQUES',
                },
                {
                    'label': 'Indigenous Territories',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/INDIGENOUS_TERRITORIES',
                },
                {
                    'label': 'Legal Amazon',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/LEGAL_AMAZON',
                },
                {
                    'label': 'Matopiba',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/MATOPIBA',
                },
                {
                    'label': 'Political Level 1',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/POLITICAL_LEVEL_1',
                },
                {
                    'label': 'Political Level 2',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/POLITICAL_LEVEL_2',
                },
                {
                    'label': 'Political Level 3',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/POLITICAL_LEVEL_3',
                },
                {
                    'label': 'Protected Area',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/PROTECTED_AREA',
                },
                {
                    'label': 'Quilombos',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/QUILOMBOS',
                },
                {
                    'label': 'Biosphere Reserve',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/RESERVA_DA_BIOSFERA',
                },
                {
                    'label': 'Semiarid',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/SEMIARID',
                },
                {
                    'label': 'Settlements',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/SETTLEMENTS',
                },
                {
                    'label': 'UGRHS',
                    'value': 'projects/mapbiomas-territories/assets/TERRITORIES/LULC/BRAZIL/COLLECTION9/WORKSPACE/UGRHS',
                }
            ]
        },

        selectedRegion: null,
        selectedCollection: null,
        selectedDataType: null,

        collections: {
            'mapbiomas-brazil': {
                'collection-5.0': {
                    'assets': { //TODO: Inserir os assets públicos
                        'deforestation_sec_vegetation': 'projects/mapbiomas-workspace/public/collection5/mapbiomas_collection50_deforestation_regeneration_v1',
                        // 'deforestation_pv': '',
                        // 'deforestation_sv': '',
                        // 'secondary_vegetation': '',
                        // 'secondary_vegetation_age': '',
                    },

                    'periods': {
                        'deforestation_sec_vegetation': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017',
                        ],
                        'secondary_vegetation': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017',
                        ],
                        'secondary_vegetation_age': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017',
                        ],
                        'deforestation_sv': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017',
                        ],
                        'deforestation_pv': [
                            'deforestation_pv_year'
                        ],


                    },
                },
                'collection-6.0': {
                    'assets': { //TODO: Inserir os assets públicos
                        'deforestation_sec_vegetation': 'projects/mapbiomas-workspace/public/collection6/mapbiomas_collection60_deforestation_regeneration_v1',
                        // 'deforestation_pv': ''
                        // 'deforestation_sv': '',
                        // 'secondary_vegetation': '',
                        // 'secondary_vegetation_age': '',
                    },

                    'periods': {
                        'deforestation_sec_vegetation': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019'
                        ],
                        'secondary_vegetation': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019'
                        ],
                        'secondary_vegetation_age': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019'
                        ],
                        'deforestation_sv': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019'
                        ],
                        'deforestation_pv': [
                            'deforestation_pv_year'
                        ],


                    },
                },
                'collection-7.0': {
                    'assets': { //TODO: Inserir os assets públicos
                        'deforestation_sec_vegetation': 'projects/mapbiomas-workspace/public/collection7/mapbiomas_collection70_deforestation_regeneration_v1',
                        // 'deforestation_pv': ''
                        // 'deforestation_sv': '',
                        // 'secondary_vegetation': '',
                        // 'secondary_vegetation_age': '',
                    },

                    'periods': {
                        'deforestation_sec_vegetation': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019'
                        ],
                        'secondary_vegetation': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019'
                        ],
                        'secondary_vegetation_age': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019'
                        ],
                        'deforestation_sv': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019'
                        ],
                        'deforestation_pv': [
                            'deforestation_pv_year'
                        ],


                    },
                },
                'collection-7.1': {
                    'assets': { //TODO: Inserir os assets públicos
                        'deforestation_sec_vegetation': 'projects/mapbiomas-workspace/public/collection7_1/mapbiomas_collection71_deforestation_regeneration_v1',
                        // 'deforestation_pv': ''
                        // 'deforestation_sv': '',
                        // 'secondary_vegetation': '',
                        'secondary_vegetation_age': 'projects/mapbiomas-workspace/public/collection7_1/mapbiomas_collection71_secondary_vegetation_age_v1',
                    },

                    'periods': {
                        'deforestation_sec_vegetation': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019'
                        ],
                        'secondary_vegetation': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019'
                        ],
                        'secondary_vegetation_age': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019'
                        ],
                        'deforestation_sv': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019'
                        ],
                        'deforestation_pv': [
                            'deforestation_pv_year'
                        ],


                    },
                },
                'collection-8.0': {
                    'assets': { //TODO: Inserir os assets públicos
                        'deforestation_sec_vegetation': 'projects/mapbiomas-workspace/public/collection8/mapbiomas_collection80_deforestation_secondary_vegetation_v1',
                        // 'deforestation_pv': ''
                        // 'deforestation_sv': '',
                        // 'secondary_vegetation': '',
                        'secondary_vegetation_age': 'projects/mapbiomas-workspace/public/collection8/mapbiomas_collection80_secondary_vegetation_age_v1',
                    },

                    'periods': {
                        'deforestation_sec_vegetation': [
                            '1986', '1987', 
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019',
                            '2020', '2021'
                        ],
                        'secondary_vegetation': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019'
                        ],
                        'secondary_vegetation_age': [
                            '1986', '1987',
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019',
                            '2020', '2021'
                        ],
                        'deforestation_sv': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019'
                        ],
                        'deforestation_pv': [
                            'deforestation_pv_year'
                        ],


                    },
                },
                'collection-9.0': {
                    'assets': { //TODO: Inserir os assets públicos
                        'deforestation_sec_vegetation': 'projects/mapbiomas-public/assets/brazil/lulc/collection9/mapbiomas_collection90_deforestation_secondary_vegetation_v1',
                        // 'deforestation_pv': ''
                        // 'deforestation_sv': '',
                        // 'secondary_vegetation': '',
                        'secondary_vegetation_age': 'projects/mapbiomas-public/assets/brazil/lulc/collection9/mapbiomas_collection90_secondary_vegetation_age_v1',
                    },

                    'periods': {
                        'deforestation_sec_vegetation': [
                            '1986', '1987', 
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019',
                            '2020', '2021', '2022', '2023'
                        ],
                        'secondary_vegetation': [
                            '1986', '1987',
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019',
                            '2020', '2021', '2022', '2023'
                        ],
                        'secondary_vegetation_age': [
                            '1986', '1987',
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019',
                            '2020', '2021', '2022', '2023'
                        ],
                        'deforestation_sv': [
                            '1988', '1989', '1990', '1991',
                            '1992', '1993', '1994', '1995',
                            '1996', '1997', '1998', '1999',
                            '2000', '2001', '2002', '2003',
                            '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011',
                            '2012', '2013', '2014', '2015',
                            '2016', '2017', '2018', '2019',
                            '2020', '2021', '2022', '2023'
                        ],
                        'deforestation_pv': [
                            'deforestation_pv_year'
                        ],


                    },
                },
            },

        },

        bandsNames: { //TODO: ajustar o nome das bandas no asset publico
            'deforestation_sec_vegetation': 'classification_',
            'deforestation_pv': '',
            'deforestation_sv': 'deforestation_sv_',
            'secondary_vegetation': 'product_',//'secondary_vegetation_',
            'secondary_vegetation_age': 'secondary_vegetation_age_'
        },

        dataType: 'deforestation_pv',

        data: {
            'deforestation_sec_vegetation': null,
            'deforestation_pv': null,
            'deforestation_sv': null,
            'secondary_vegetation': null,
            'secondary_vegetation_age': null
        },

        fileDimensions: {
            'deforestation_sec_vegetation': 256 * 124,
            'deforestation_pv': 256 * 124,
            'deforestation_sv': 256 * 512,
            'secondary_vegetation': 256 * 512,
            'secondary_vegetation_age': 256 * 512,
        },

        ranges: {
            'deforestation_pv': {
                'min': 1988,
                'max': 2019
            },
            'deforestation_sv': {
                'min': 0,
                'max': 30 //TODO: ajustar os params min e max para visualização
            },
            'secondary_vegetation': {
                'min': 0,
                'max': 1
            },
            'secondary_vegetation_age': {
                'min': 0,
                'max': 30
            },
            'deforestation_sec_vegetation': {
                'min': 0,
                'max': 7
            },
        },

        palette: { //TODO: Criar paleta de cores para visualização
            'deforestation_pv': [
                '#fff5f0',
                '#fee0d2',
                '#fcbba1',
                '#fc9272',
                '#fb6a4a',
                '#ef3b2c',
                '#cb181d',
                '#a50f15',
                '#67000d'
            ],

            'deforestation_sv': [
                '#fff5f0',
                '#fee0d2',
                '#fcbba1',
                '#fc9272',
                '#fb6a4a',
                '#ef3b2c',
                '#cb181d',
                '#a50f15',
                '#67000d'
            ],

            'secondary_vegetation': palettes.get('classification5'),

            'secondary_vegetation_age': [
                '#ffffe5',
                '#f7fcb9',
                '#d9f0a3',
                '#addd8e',
                '#78c679',
                '#41ab5d',
                '#238443',
                '#006837',
                '#004529'
            ],

            'deforestation_sec_vegetation': [
                "#212121", // [0] Outros
                "#fffbc2", // [1] Antrópico
                "#09611f", // [2] Vegetação primária
                "#4ea376", // [3] Vegetação secundária
                "#e31a1c", // [4] Antropismo em vegetação primária
                "#94fc03", // [5] Recuperação para veg secundaria
                "#ffa500", // [6] Antropismo em vegetação secundária
                "#212121", // [7] Não se aplica  
            ],

        },

        vector: null,
        activeFeature: null,
        activeName: '',

        taskid: 1,

        bufferDistance: 0,

        className: {

            'deforestation_sec_vegetation': {
                0: 'Other',
                1: 'Anthropic',
                2: 'Primary Vegetation',
                3: 'Secondary Vegetation',
                4: 'Deforestation in  Primary Vegetation',
                5: 'Secondary Vegetation Regrowth',
                6: 'Deforestation in  Secondary Vegetation',
                7: 'Not applied',
                8: 'Not applied',
            },
            'classification': {
                1: "Forest",
                2: "Natural Forest",
                3: "Forest Formation",
                4: "Savanna Formation",
                5: "Magrove",
                6: "Áreas Naturales Inundables - Leñosas (Bosque Inundable)",
                9: "Forest Plantation",
                10: "Non Forest Natural Formation",
                11: "Wetland",
                12: "Grassland (Pastizal, Formación Herbácea)",
                13: "Other Non Forest Natural Formation",
                14: "Farming",
                15: "Pasture",
                18: "Agriculture",
                19: "Temporary Crops (Herbaceas - Agricultura)",
                20: "Sugar Cane",
                21: "Mosaic of Agriculture and Pasture",
                22: "Non vegetated area",
                23: "Beach and Dune",
                24: "Urban Infrastructure",
                25: "Other Non Vegetated Area",
                26: "Water",
                27: "Non Observed",
                29: "Rocky outcrop",
                30: "Mining",
                31: "Aquaculture",
                32: "Salt flat",
                33: "River, Lake and Ocean",
                34: "Glacier",
                35: "Oil Palm",
                36: "Perennial Crops",
                37: "Artificial Water Body",
                38: "Water Reservoirs",
                39: "Soy Beans",
                40: "Rice",
                41: "Mosaic of Crops",
                42: "Pastizal abierto", // Only for Chaco
                43: "Pastizal cerrado", // Only for Chaco
                44: "Pastizal disperso", // Only for Chaco
                45: "Leñosas dispersas", // Only for Chaco
                46: 'Coffe',
                47: 'Citrus',
                48: 'Other Perennial Crops',
                49: 'Wooded Sandbank Vegetation',
                50: 'Herbaceous Sandbank Vegetation',
                57: 'Cultivo Simples', // Only for Chaco
                58: 'Cultivo Múltiple', // Only for Chaco
                62: "Cotton",
                0: "Non Observed",
            }
        },

        legend: {
            params: {
                "title": 'Legend',
                "layers": [
                    ["#fffbc2", 1, 'Anthropic',],
                    ["#09611f", 2, 'Primary Vegetation',],
                    ["#4ea376", 3, 'Secondary Vegetation',],
                    ["#e31a1c", 4, 'Deforestation in  Primary Vegetation',],
                    ["#94fc03", 5, 'Secondary Vegetation Regrowth',],
                    ["#ffa500", 6, 'Deforestation in  Secondary Vegetation',],
                    ["#212121", 7, 'Not applied',],
                ],
                "style": {
                    "backgroundColor": "#ffffff",
                    "color": "#212121"
                },
                "orientation": "vertical"
            }
        }
    },

    init: function () {

        App.ui.init();

    },

    setVersion: function () {

        App.ui.form.labelTitle.setValue('MapBiomas User Toolkit ' + App.options.version);

    },

    startMap: function (year) {

        Map.centerObject(App.options.data.deforestation_sec_vegetation, 5);

        var imageLayer = ui.Map.Layer({
            'eeObject': App.options.data.deforestation_sec_vegetation.divide(100).byte(),
            'visParams': {
                'bands': ['classification_' + year],
                'palette': App.options.palette.deforestation_sec_vegetation,
                'min': App.options.ranges.deforestation_sec_vegetation.min,
                'max': App.options.ranges.deforestation_sec_vegetation.max,
                'format': 'png'
            },
            'name': 'Deforestation and Regeneration',
            'shown': true,
            'opacity': 1.0
        });

        App.ui.clear();

        Map.add(imageLayer);

    },

    formatName: function (name) {

        var formated = name
            .toLowerCase()
            .replace(/á/g, 'a')
            .replace(/à/g, 'a')
            .replace(/â/g, 'a')
            .replace(/ã/g, 'a')
            .replace(/ä/g, 'a')
            .replace(/ª/g, 'a')
            .replace(/é/g, 'e')
            .replace(/ê/g, 'e')
            .replace(/í/g, 'i')
            .replace(/ó/g, 'o')
            .replace(/ô/g, 'o')
            .replace(/õ/g, 'o')
            .replace(/ú/g, 'u')
            .replace(/û/g, 'u')
            .replace(/ũ/g, 'u')
            .replace(/ç/g, 'c')
            .replace(/ñ/g, 'n')
            .replace(/&/g, '')
            .replace(/@/g, '')
            .replace(/ /g, '')
            .replace(/["'()\/]/g, '');

        return formated;
    },

    ui: {

        init: function () {

            App.ui.form.init();

        },

        clear: function () {
            Map.clear();

            Map.setOptions({
                'styles': {
                    'Dark': mapp.getStyle('Dark')
                }
            });
        },

        setMapbiomasRegion: function (regionName) {

            App.ui.loadCollectionList(regionName);
            App.ui.loadTablesNames(regionName);

        },

        setDataType: function (dataType) {

            App.options.dataType = dataType;

        },

        loadCollectionList: function (regionName) {

            App.ui.form.selectCollection.setPlaceholder('loading collections...');

            App.ui.form.selectCollection = ui.Select({
                'items': Object.keys(App.options.collections[regionName]).reverse(),
                'placeholder': 'select collection',
                'onChange': function (collectioName) {
                    ee.Number(1).evaluate(
                        function (a) {
                            // App.options.data.deforestation_pv = ee.Image(
                            //     App.options.collections[regionName][collectioName].assets.deforestation_pv);

                            // App.options.data.deforestation_sv = ee.Image(
                            //     App.options.collections[regionName][collectioName].assets.deforestation_sv);

                            // App.options.data.secondary_vegetation = ee.Image(
                            //     App.options.collections[regionName][collectioName].assets.secondary_vegetation);

                            
                            App.options.data.deforestation_sec_vegetation = ee.Image(
                                App.options.collections[regionName][collectioName].assets.deforestation_sec_vegetation);
                                
                            if (collectioName == 'collection-7.1') {
                                App.options.data.secondary_vegetation_age = ee.Image(
                                    App.options.collections[regionName][collectioName].assets.secondary_vegetation_age);
                            }

                            if (collectioName == 'collection-8.0') {
                                App.options.data.secondary_vegetation_age = ee.Image(
                                    App.options.collections[regionName][collectioName].assets.secondary_vegetation_age);
                            }

                            //
                            var bandNames = App.options.data.deforestation_sec_vegetation.bandNames()
                                .map(
                                    function (band) {
                                        return ee.String(band).replace('product', 'classification');
                                    }
                                )

                            App.options.data.deforestation_sec_vegetation = App.options.data.deforestation_sec_vegetation.rename(bandNames);

                            //
                            var year = App.options.collections[regionName][collectioName]
                                .periods.secondary_vegetation.slice(-1)[0];

                            App.options.selectedCollection = collectioName
                            App.startMap(year);
                        }
                    );

                    App.ui.loadingBox();
                },
                'style': {
                    'stretch': 'horizontal'
                }
            });

            App.ui.form.panelCollection.widgets()
                .set(1, App.ui.form.selectCollection);

        },

        loadTablesNames: function (regionName) {

            App.ui.form.selectRegion.setPlaceholder('loading tables names...');

            var roots = ee.data.getAssetRoots()
                .map(
                    function (obj) {
                        return obj.id;
                    });

            roots = roots.filter(function (caminho) {
                return caminho.indexOf('/MAPBIOMAS') != -1;
            });

            var allTablesNames = [];

            /**
             * Skip the error msg if MAPBIOMAS folder is not found
             */

            try {
                var tablesNames = ee.data.getList({
                    'id': roots[0]
                }).map(
                    function (obj) {
                        return obj.id;
                    });

                allTablesNames = allTablesNames.concat(App.options.tables[regionName]).concat(tablesNames);
            }
            catch (e) {
                allTablesNames = allTablesNames.concat(App.options.tables[regionName]);
            }

            App.ui.form.selectFeatureCollections = ui.Select({
                'items': allTablesNames,
                'placeholder': 'select table',
                'onChange': function (tableName) {
                    if (tableName != 'None') {
                        App.options.activeName = tableName;
                        App.ui.form.panelStates.remove(App.ui.form.labelStates);
                        App.ui.form.panelStates.remove(App.ui.form.selectStates);
                        ee.Number(1).evaluate(
                            function (a) {
                                var collectioName = App.ui.form.selectCollection.getValue();

                                App.ui.loadTable(tableName);

                                App.ui.makeLayersList(
                                    tableName.split('/').slice(-1)[0],
                                    App.options.activeFeature,
                                    App.options.collections[regionName][collectioName]
                                        .periods[App.options.dataType]
                                );

                                App.ui.loadPropertiesNames();

                                App.ui.form.selectDataType.setDisabled(false);
                            }
                        );

                        App.ui.loadingBox();
                    }
                },
                'style': {
                    'stretch': 'horizontal'
                }
            });

            App.ui.form.panelFeatureCollections.widgets()
                .set(1, App.ui.form.selectFeatureCollections);

        },

        loadTableStates: function (tableName) {

            var state = App.ui.form.selectStates.getValue();

            App.options.table = ee.FeatureCollection(tableName)
                .filterMetadata('UF', 'equals', parseInt(App.options.statesNames[state], 10));

            App.options.activeFeature = App.options.table;

            Map.centerObject(App.options.activeFeature);

            App.ui.clear();

            Map.addLayer(App.options.activeFeature.style({
                color: 'ff0000',
                width: 1,
                fillColor: 'ff000033',
            }), {},
                tableName.split('/')[3],
                true);

        },

        loadTable: function (tableName) {

            App.options.table = ee.FeatureCollection(tableName);

            App.options.activeFeature = App.options.table;

            // Map.centerObject(App.options.activeFeature);

            App.ui.clear();

            Map.addLayer(App.options.activeFeature.style({
                color: 'ff0000',
                width: 1,
                fillColor: 'ff000033',
            }), {},
                tableName.split('/')[3],
                true);

        },

        loadPropertiesNames: function () {

            App.ui.form.selectProperties.setPlaceholder('loading tables names...');

            ee.Feature(App.options.table.first())
                .propertyNames()
                .evaluate(
                    function (propertyNames) {

                        // print(propertyNames);

                        App.ui.form.selectProperties = ui.Select({
                            'items': propertyNames,
                            'placeholder': 'select property',
                            'onChange': function (propertyName) {
                                if (propertyName != 'None') {
                                    App.options.propertyName = propertyName;

                                    ee.Number(1).evaluate(
                                        function (a) {
                                            App.ui.loadFeatureNames(propertyName);
                                            App.ui.form.selectDataType.setDisabled(false);
                                        }
                                    );

                                }
                            },
                            'style': {
                                'stretch': 'horizontal'
                            }
                        });

                        App.ui.form.panelProperties.widgets()
                            .set(1, App.ui.form.selectProperties);
                    }
                );

        },

        loadFeatureNames: function () {

            App.ui.form.selectFeature.setPlaceholder('loading feature names...');

            App.options.table.sort(App.options.propertyName)
                .reduceColumns(ee.Reducer.toList(), [App.options.propertyName])
                .get('list')
                .evaluate(
                    function (featureNameList) {

                        App.ui.form.selectFeature = ui.Select({
                            'items': featureNameList,
                            'placeholder': 'select feature',
                            'onChange': function (featureName) {
                                if (featureName != 'None') {
                                    App.options.featureName = featureName;

                                    ee.Number(1).evaluate(
                                        function (a) {
                                            var regionName = App.ui.form.selectRegion.getValue();
                                            var collectionName = App.ui.form.selectCollection.getValue();

                                            App.ui.loadFeature(featureName);

                                            App.ui.makeLayersList(
                                                featureName,
                                                App.options.activeFeature,
                                                App.options.collections[regionName][collectionName]
                                                    .periods[App.options.dataType]);

                                            App.ui.loadDataTypeNames();
                                            App.ui.form.selectDataType.setDisabled(false);
                                        }
                                    );

                                    App.ui.loadingBox();
                                }
                            },
                            'style': {
                                'stretch': 'horizontal'
                            }
                        });

                        App.ui.form.panelFeature.widgets()
                            .set(1, App.ui.form.selectFeature);
                    }
                );

        },

        loadFeature: function (name) {

            App.options.activeFeature = App.options.table
                .filterMetadata(App.options.propertyName, 'equals', name);

            Map.centerObject(App.options.activeFeature);

            App.ui.clear();

            Map.addLayer(App.options.activeFeature.style({
                color: 'ff0000',
                width: 1,
                fillColor: 'ff000033',
            }), {},
                name,
                true);

        },

        loadDataTypeNames: function () {

            App.ui.form.selectDataType.setPlaceholder('loading product names...');

            App.ui.form.selectDataType = ui.Select({
                'items': Object.keys(App.options.collections[App.options.selectedRegion][App.options.selectedCollection].assets),
                'placeholder': 'Select Data Type',
                'onChange': function (dataType) {

                    var regionName = App.ui.form.selectRegion.getValue();
                    var collectionName = App.ui.form.selectCollection.getValue();

                    App.ui.setDataType(dataType);

                    App.ui.makeLayersList(
                        App.options.activeName.split('/').slice(-1)[0],
                        App.options.activeFeature,
                        App.options.collections[regionName][collectionName].periods[dataType]);

                    App.options.selectedDataType = dataType;

                },
                'style': {
                    'stretch': 'horizontal'
                }
            });

            App.ui.form.panelDataType.widgets()
                .set(1, App.ui.form.selectDataType);
        },

        addImageLayer: function (period, label, region) {


            if (App.options.selectedDataType == 'deforestation_sec_vegetation'){

                var image = App.options.data[App.options.dataType]
                    .select([App.options.bandsNames[App.options.dataType] + period])
                    .divide(100).byte()
                    .clip(region);
            } else {
                var image = App.options.data[App.options.dataType]
                    .select([App.options.bandsNames[App.options.dataType] + period])
                    .clip(region);
            }

            var imageLayer = ui.Map.Layer({
                'eeObject': image.selfMask(),
                'visParams': {
                    'palette': App.options.palette[App.options.dataType],
                    'min': App.options.ranges[App.options.dataType].min,
                    'max': App.options.ranges[App.options.dataType].max,
                    'format': 'png'
                },
                'name': label,
                'shown': true,
                'opacity': 1.0
            });

            Map.layers().insert(
                Map.layers().length() - 1,
                imageLayer
            );

        },

        removeImageLayer: function (label) {

            for (var i = 0; i < Map.layers().length(); i++) {

                var layer = Map.layers().get(i);

                if (label === layer.get('name')) {
                    Map.remove(layer);
                }
            }

        },

        manageLayers: function (checked, period, label, region) {

            if (checked) {
                App.ui.addImageLayer(period, label, region);
            } else {
                App.ui.removeImageLayer(label);
            }

        },

        makeLayersList: function (regionName, region, periods) {
            // print(regionName, region, periods)
            App.ui.form.panelLayersList.clear();

            periods.forEach(

                function (period, index, array) {
                    App.ui.form.panelLayersList.add(
                        ui.Checkbox({
                            "label": regionName + ' ' + period,
                            "value": false,
                            "onChange": function (checked) {

                                App.ui.manageLayers(checked, period, regionName + ' ' + period, region);

                            },
                            "disabled": false,
                            "style": {
                                'padding': '2px',
                                'stretch': 'horizontal',
                                'backgroundColor': '#dddddd',
                                'fontSize': '12px'
                            }
                        })
                    );

                }
            );

        },

        loadingBox: function () {
            App.ui.form.loadingBox = ui.Panel();
            App.ui.form.loadingBox.add(ui.Label('Loading...'));

            Map.add(App.ui.form.loadingBox);
        },

        export2Drive: function () {

            var layers = App.ui.form.panelLayersList.widgets();

            var regionName = App.ui.form.selectRegion.getValue();
            var collectionName = App.ui.form.selectCollection.getValue();

            var featureName = App.formatName(App.ui.form.selectFeature.getValue() || '');

            var bandIds = [];

            for (var i = 0; i < layers.length(); i++) {

                var selected = layers.get(i).getValue();

                if (selected) {

                    var period = App.options.collections[regionName][collectionName]
                        .periods[App.options.dataType][i];

                    var fileName = [regionName, collectionName, featureName, period].join('-');

                    fileName = fileName.replace(/--/g, '-').replace(/--/g, '-').replace('.', '');
                    fileName = App.formatName(fileName);

                    var data = App.options.data[App.options.dataType]
                        .select([App.options.bandsNames[App.options.dataType] + period]);

                    var region = App.options.activeFeature.geometry();

                    if (App.options.bufferDistance !== 0) {
                        data = data.clip(App.options.activeFeature.geometry().buffer(App.options.bufferDistance));
                        region = region.buffer(App.options.bufferDistance);
                    } else {
                        data = data.clip(App.options.activeFeature.geometry());
                    }

                    region = region.bounds();

                    Export.image.toDrive({
                        image: data,
                        description: fileName,
                        folder: 'MAPBIOMAS-EXPORT',
                        fileNamePrefix: fileName,
                        region: region,
                        scale: 30,
                        maxPixels: 1e13,
                        fileFormat: 'GeoTIFF',
                        fileDimensions: App.options.fileDimensions[App.options.dataType],
                    });

                    bandIds.push(App.options.bandsNames[App.options.dataType] + period);
                }
            }

            // Export table
            var territory = ee.Image().paint({
                'featureCollection': ee.FeatureCollection(App.options.activeFeature),
                'color': 1
            });

            var geometry = App.options.activeFeature.geometry().bounds();

            var areas = bandIds.map(
                function (band) {

                    var image = App.options.data[App.options.dataType].select(band);

                    var area = Area.calculate({
                        "image": image,
                        "territory": territory,
                        "geometry": geometry,
                        "scale": 30,
                        "factor": 1000000,
                        "unit": 'kilometers^2'
                    });

                    area = ee.FeatureCollection(area).map(
                        function (feature) {

                            var defRegClass = ee.Number(feature.get('class')).divide(100).int16();
                            var lulcClass = ee.Number(feature.get('class')).mod(100).int16();

                            var defRegClassName = ee.Dictionary(App.options.className[App.options.dataType])
                                .get(defRegClass);

                            var lulcClassName = ee.Dictionary(App.options.className.classification)
                                .get(lulcClass);

                            return feature
                                .set('class_name', defRegClassName)
                                .set('lulc_class_name', lulcClassName)
                                .set('band', band);
                        }
                    );

                    return area;
                }
            );

            areas = ee.FeatureCollection(areas).flatten();
            // print(areas);

            var tableName = [regionName, collectionName, featureName, 'area'].join('-');

            tableName = tableName.replace(/--/g, '-').replace(/--/g, '-').replace('.', '');
            tableName = App.formatName(tableName);

            Export.table.toDrive({
                'collection': areas,
                'description': tableName,
                'folder': 'MAPBIOMAS-EXPORT',
                'fileNamePrefix': tableName,
                'fileFormat': 'CSV'
            });

        },

        form: {

            init: function () {

                var blob = ee.Blob(App.options.logo.uri);

                blob.string().evaluate(
                    function (str) {
                        str = str.replace(/\n/g, '');
                        App.options.logo.base64 = ui.Label({
                            imageUrl: str,
                        });
                        App.ui.form.panelLogo.add(App.options.logo.base64);
                    }
                );

                App.ui.form.panelMain.add(App.ui.form.panelLogo);
                App.ui.form.panelMain.add(App.ui.form.labelTitle);
                App.ui.form.panelMain.add(App.ui.form.labelSubtitle);
                App.ui.form.panelMain.add(App.ui.form.labelLink);

                App.ui.form.panelRegion.add(App.ui.form.labelRegion);
                App.ui.form.panelRegion.add(App.ui.form.selectRegion);

                App.ui.form.panelCollection.add(App.ui.form.labelCollection);
                App.ui.form.panelCollection.add(App.ui.form.selectCollection);

                App.ui.form.panelFeatureCollections.add(App.ui.form.labelTables);
                App.ui.form.panelFeatureCollections.add(App.ui.form.selectFeatureCollections);

                App.ui.form.panelProperties.add(App.ui.form.labelProperties);
                App.ui.form.panelProperties.add(App.ui.form.selectProperties);

                App.ui.form.panelFeature.add(App.ui.form.labelFeature);
                App.ui.form.panelFeature.add(App.ui.form.selectFeature);

                App.ui.form.panelDataType.add(App.ui.form.labelDataType);
                App.ui.form.panelDataType.add(App.ui.form.selectDataType);

                App.ui.form.panelBuffer.add(App.ui.form.labelBuffer);
                App.ui.form.panelBuffer.add(App.ui.form.selectBuffer);

                App.ui.form.panelLegend.add(legend.getLegend(App.options.legend.params));

                // App.ui.form.panelMain.add(App.ui.form.panelType);
                App.ui.form.panelMain.add(App.ui.form.panelRegion);
                App.ui.form.panelMain.add(App.ui.form.panelCollection);
                App.ui.form.panelMain.add(App.ui.form.panelFeatureCollections);
                App.ui.form.panelMain.add(App.ui.form.panelStates);
                App.ui.form.panelMain.add(App.ui.form.panelProperties);
                App.ui.form.panelMain.add(App.ui.form.panelFeature);
                App.ui.form.panelMain.add(App.ui.form.panelDataType);
                App.ui.form.panelMain.add(App.ui.form.panelLegend);
                App.ui.form.panelMain.add(App.ui.form.panelBuffer);

                App.ui.form.panelMain.add(App.ui.form.labelLayers);
                App.ui.form.panelMain.add(App.ui.form.panelLayersList);

                App.ui.form.panelMain.add(App.ui.form.buttonExport2Drive);
                App.ui.form.panelMain.add(App.ui.form.labelNotes);

                ui.root.add(App.ui.form.panelMain);

            },

            panelMain: ui.Panel({
                'layout': ui.Panel.Layout.flow('vertical'),
                'style': {
                    'width': '360px',
                    'position': 'bottom-left',
                    'margin': '0px 0px 0px 0px',
                },
            }),

            panelLogo: ui.Panel({
                'layout': ui.Panel.Layout.flow('vertical'),
                'style': {
                    'stretch': 'horizontal',
                    'margin': '10px 0px 5px 15px',
                },
            }),

            panelStates: ui.Panel({
                'layout': ui.Panel.Layout.flow('vertical'),
                'style': {
                    'stretch': 'horizontal'
                },
            }),

            panelRegion: ui.Panel({
                'layout': ui.Panel.Layout.flow('vertical'),
                'style': {
                    'stretch': 'horizontal'
                },
            }),

            panelCollection: ui.Panel({
                'layout': ui.Panel.Layout.flow('vertical'),
                'style': {
                    'stretch': 'horizontal'
                },
            }),

            panelFeatureCollections: ui.Panel({
                'layout': ui.Panel.Layout.flow('vertical'),
                'style': {
                    'stretch': 'horizontal'
                },
            }),

            panelProperties: ui.Panel({
                'layout': ui.Panel.Layout.flow('vertical'),
                'style': {
                    'stretch': 'horizontal'
                },
            }),

            panelFeature: ui.Panel({
                'layout': ui.Panel.Layout.flow('vertical'),
                'style': {
                    'stretch': 'horizontal'
                },
            }),

            panelDataType: ui.Panel({
                'layout': ui.Panel.Layout.flow('vertical'),
                'style': {
                    'stretch': 'horizontal'
                },
            }),

            panelLegend: ui.Panel({
                'layout': ui.Panel.Layout.flow('vertical'),
                'style': {
                    'stretch': 'vertical',
                    'position': 'bottom-left'
                },
            }),

            panelBuffer: ui.Panel({
                'layout': ui.Panel.Layout.flow('vertical'),
                'style': {
                    'stretch': 'horizontal'
                },
            }),

            panelLayersList: ui.Panel({
                'layout': ui.Panel.Layout.flow('vertical'),
                'style': {
                    'height': '200px',
                    'stretch': 'vertical',
                    'backgroundColor': '#cccccc',
                },
            }),

            labelRegion: ui.Label('Region', {
                // 'fontWeight': 'bold',
                // 'padding': '1px',
                'fontSize': '16px'
            }),

            labelCollection: ui.Label('Collection', {
                // 'fontWeight': 'bold',
                // 'padding': '1px',
                'fontSize': '16px'
            }),

            labelTitle: ui.Label('MapBiomas User Toolkit', {
                'fontWeight': 'bold',
                // 'padding': '1px',
                'fontSize': '16px'
            }),

            labelSubtitle: ui.Label('Deforestation and Secondary Vegetation', {
                // 'fontWeight': 'bold',
                // 'padding': '1px',
                'fontSize': '14px'
            }),

            labelLink: ui.Label('Legend codes', {
                // 'fontWeight': 'bold',
                // 'padding': '1px',
                'fontSize': '10px'
            },
                'https://mapbiomas.org/codigos-de-legenda?cama_set_language=pt-BR'
            ),

            labelType: ui.Label('Type:', {
                // 'padding': '1px',
                'fontSize': '16px'
            }),

            labelTables: ui.Label('Tables:', {
                // 'padding': '1px',
                'fontSize': '16px'
            }),

            labelProperties: ui.Label('Properties:', {
                // 'padding': '1px',
                'fontSize': '16px'
            }),

            labelFeature: ui.Label('Features:', {
                // 'padding': '1px',
                'fontSize': '16px'
            }),

            labelDataType: ui.Label('Data Type:', {
                // 'padding': '1px',
                'fontSize': '16px'
            }),

            labelBuffer: ui.Label('Buffer:', {
                // 'padding': '1px',
                'fontSize': '16px'
            }),

            labelLayers: ui.Label('Layers:', {
                // 'padding': '1px',
                'fontSize': '16px'
            }),

            labelNotes: ui.Label('Go to TASK tab in the up-rght corner and click RUN', {
                // 'padding': '1px',
                'fontSize': '16px'
            }),

            labelStates: ui.Label('States:', {
                // 'padding': '1px',
                'fontSize': '16px'
            }),

            selectName: ui.Select({
                'items': ['None'],
                'placeholder': 'None',
                'style': {
                    'stretch': 'horizontal'
                }
            }),

            selectCollection: ui.Select({
                'items': [],
                'placeholder': 'None',
                'style': {
                    'stretch': 'horizontal'
                },
            }),

            selectRegion: ui.Select({
                'items': [
                    // 'mapbiomas-amazon',
                    // 'mapbiomas-atlantic-forest',
                    'mapbiomas-brazil',
                    // 'mapbiomas-chaco',
                    // 'mapbiomas-indonesia',
                    // 'mapbiomas-pampa',
                ],
                'placeholder': 'None',
                'style': {
                    'stretch': 'horizontal'
                },
                'onChange': function (region) {

                    ee.Number(1).evaluate(
                        function (a) {
                            App.ui.setMapbiomasRegion(region);
                            App.options.selectedRegion = region;
                        }
                    );

                },
            }),

            selectFeatureCollections: ui.Select({
                'items': ['None'],
                'placeholder': 'None',
                'style': {
                    'stretch': 'horizontal'
                }
            }),

            selectFeature: ui.Select({
                'items': ['None'],
                'placeholder': 'None',
                'style': {
                    'stretch': 'horizontal'
                }
            }),

            selectProperties: ui.Select({
                'items': ['None'],
                'placeholder': 'None',
                'style': {
                    'stretch': 'horizontal'
                }
            }),

            selectDataType: ui.Select({
                'items': [
                    // 'deforestation_pv',
                    // 'deforestation_sv',
                    // 'secondary_vegetation',
                    // 'secondary_vegetation_age',
                    // 'deforestation_sec_vegetation'
                ],
                'placeholder': 'Data type',
                'style': {
                    'stretch': 'horizontal'
                },
                'disabled': true,
                'onChange': function (dataType) {

                    var regionName = App.ui.form.selectRegion.getValue();
                    var collectionName = App.ui.form.selectCollection.getValue();

                    App.ui.setDataType(dataType);

                    App.ui.makeLayersList(
                        App.options.activeName.split('/').slice(-1)[0],
                        App.options.activeFeature,
                        App.options.collections[regionName][collectionName].periods[dataType]);

                },
            }),

            selectBuffer: ui.Select({
                'items': [
                    'None',
                    '1km',
                    '2km',
                    '3km',
                    '4km',
                    '5km',
                ],
                'placeholder': 'None',
                'style': {
                    'stretch': 'horizontal'
                },
                'onChange': function (distance) {
                    var distances = {
                        'None': 0,
                        '1km': 1000,
                        '2km': 2000,
                        '3km': 3000,
                        '4km': 4000,
                        '5km': 5000,
                    };

                    App.options.bufferDistance = distances[distance];
                },
            }),

            selectStates: ui.Select({
                'items': [
                    'None', 'Acre', 'Alagoas', 'Amazonas', 'Amapá', 'Bahia',
                    'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão',
                    'Minas Gerais', 'Mato Grosso do Sul', 'Mato Grosso', 'Pará', 'Paraíba',
                    'Pernambuco', 'Piauí', 'Paraná', 'Rio de Janeiro', 'Rio Grande do Norte',
                    'Rondônia', 'Roraima', 'Rio Grande do Sul', 'Santa Catarina', 'Sergipe',
                    'São Paulo', 'Tocantins'
                ],
                'placeholder': 'select state',
                'onChange': function (state) {
                    if (state != 'None') {

                        ee.Number(1).evaluate(
                            function (a) {
                                App.ui.loadTableStates(App.options.activeName);
                                App.ui.makeLayersList(App.options.activeName.split('/')[3], App.options.activeFeature, App.options.periods[App.options.dataType]);
                                App.ui.loadPropertiesNames();
                                App.ui.form.selectDataType.setDisabled(false);
                            }
                        );

                        App.ui.loadingBox();
                    }
                },
                'style': {
                    'stretch': 'horizontal'
                }
            }),

            buttonExport2Drive: ui.Button({
                "label": "Export images to Google Drive",
                "onClick": function () {
                    App.ui.export2Drive();
                },
                "disabled": false,
                "style": {
                    // 'padding': '2px',
                    'stretch': 'horizontal'
                }
            }),

        },
    }
};

App.init();

App.setVersion();
