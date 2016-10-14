'use strict'

const request = require('request');

start();

function start(){
    request({
        uri: 'http://www.pontoslivelo.com.br/rest/model/atg/commerce/catalog/ProductCatalogActor/',
        method: 'GET',
        timeout: 50000
    }, function (error, response, body) {
        try{
          var result = JSON.parse(body).rootCategories;
          for (var i = 0; i < result.length; i++) {
            getCategory(result[i].id);
        }
        }catch(e){
            return
        }    
});    
}

function getCategory(catalog){
 request({
    uri: 'http://www.pontoslivelo.com.br/rest/model/atg/commerce/catalog/ProductCatalogActor/getCategory?categoryId='+catalog+'&atg-rest-output=json',
    method: 'GET',
    timeout: 50000
}, function (error, response, body) {
    if(!body) return;
    try {
        var result = JSON.parse(body);
        if(!result) return;
        var categories = result.childCategories;
        if(categories){
            for (var i = 0; i < categories.length; i++) {
                getCategory(categories[i].id);
            }   
        }
        var products = result.childProducts;
        if(products){
            for (var i = 0; i < products.length; i++) {
                var skus = products[i].childSKUs;
                if(skus.length > 0){
                    if(skus[0].gtin && skus[0].listPrice){
                        var ean = skus[0].gtin;   
                        var price = skus[0].listPrice;  
                        console.log('ean:', ean);                    
                        console.log('price:',price);    
                    }
                }
            }    
        }
    } catch (e) {
        return;
    }
});    
}


