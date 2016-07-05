/*
	jQWeather
	@description: Show weather forecast using http://openweathermap.org/ API
	@version: 0.0.1 BV
	@author: Tirumal Rao
	@license: GNU General Public License, Version 3
	@date: 4th July, 2016
 */

 ;(function($, window, document){
 	$.fn.jQWeather = function(options){

 		'use strict'; 

 		//Constants, don't change this unless you know what you are doing.
 		var CONST = {
 				'APIURI' : 'http://api.openweathermap.org/data/'
 			,	'APIVER' : '2.5'
            ,   'mode'   : 'json'
 		};

 		//Default Settings
 		var settings = $.extend({
 				'APPID' 		: ''

 			,	'showBy'		: 2 //1: cityName, 2: cityID, 3: coordinates
 			, 	'cityName' 		: 'London'
 			, 	'cityID'		: '524901'
 			,	'coordinates' 	: {'lat' : 35, 'long' : 139}
            
 			,	'themePath'		: './themes/'
 			,	'theme'			: 'default'
            ,   'tempUnit'      : 'c' //c -> Celsius, k -> kelvin, f -> fahrenheit
            ,   'decimalPlace'  : 0
 		}, options);

 		//Internal Methods
 		var METH = {
 			init: function(el){
                METH.controller(el);
 			},

 			controller : function(el){
                
                if(settings.APPID === ''){
                    METH.render(el, {
                        header : 'jQWeather[SETTINGS_ERROR]: APP ID is required!'
                    }); 
                    return;
                }
                
                //Render
                METH.request( METH.queryConstruct(), function(result, status){
                    METH.render(el, {
                        header : result.city.name,
                        currentTemp: METH.tempConverter(result.list[0].main.temp),
                        list : ''
                    });
                }, function(error, status){
                    METH.render(el, {
                        header : 'jQWeather[PROTOCOL_ERROR]: Error fetching the data from weather API'
                    });
                });
 			},
            
            //Construct Search Query
            queryConstruct : function(){
                
                var query = '';
                /*
                  ShowBy cityName or cityID or Co-ordinates
                  Query Construct
                */
 				switch(settings.showBy){
                    case 1 : 
                        query = 'q=' + settings.cityName;
                        break;
                    case 2 :
                        query = 'id=' + settings.cityID;
                        break;
                    case 3 :
                        query = 'lat=' + settings.coordinates.lat + '&lon=' + settings.coordinates.long;
                        break;
                    default:
                        query = 'q=' + settings.cityName;
                }
                
                return query;
            },
            
            //Temperature Converter, base unit is kelvin
            tempConverter : function(temp){
                var result = '', unit = '';
                if(settings.tempUnit === 'c'){
                    result = (parseInt(temp) - 273.15).toFixed(settings.decimalPlace);
                    unit = 'C';
                } else if(settings.tempUnit === 'f'){
                    result = (1.8 * (parseInt(temp) - 273) + 32).toFixed(settings.decimalPlace);
                    unit = 'F';
                } else {
                    result = parseInt(temp).toFixed(settings.decimalPlace);
                    unit = 'K';
                }
                
                return result + '<sup>&#176;</sup> ' + unit;
            },

            //API Request
 			request : function(query, onSuccess, onFailure){
 				$.ajax({
 					type : 'GET',
 					url  : CONST.APIURI + CONST.APIVER + '/forecast?' + query + '&mode=' + CONST.mode + '&appid=' + settings.APPID,
 					success : function(result, status, xhr){
 						if(status === 'success'){
 							result = (typeof result !== 'object') ? JSON.parse(result) : result;
                            onSuccess(result, status);
 						}
 					},
 					error : function(xhr, status, error){
                        onFailure(error, status);
 					}
 				});
 			},

            // Themefy the widget
 			getTheme : function(callback){
 				$.get(settings.themePath + settings.theme + '.html', function(html){
 					callback($(html));
 				});
 			},

            //Render Themes
 			render : function(cont, obj){
 				METH.getTheme(function(resp){
                    var temp = '';
 					for(var key in obj){
                        if(obj[key] instanceof Array){
                            for(var i = 0; i < obj[key].length; i++){
                                resp.find('.'+key).parent().append('<li>'+obj[key][i]+'</li>');
                                temp = resp.find('.'+key);
                            }
                            temp.remove();
                        } else {
                            resp.find('.' + key).html(obj[key]);
                        }
	 				}
 					cont.html(resp);
 				});
 				
 			}
 		};

 		return this.each(function(index, value){
 			METH.init($(this));
 		});
 	};
 }(jQuery, window, document));