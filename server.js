'use strict'

const request = require('request');
//require('./dbConnect.js')('mongodb://localhost:27017/comparador');
require('./dbConnect.js')('mongodb://firmiano:firmiano@ds139847.mlab.com:39847/comparador');
var Comparador = require('./comparador.js')();
var count = 0;
start();

function start(){
    request({
        uri: 'http://www.pontoslivelo.com.br/rest/model/atg/commerce/catalog/ProductCatalogActor/',
        method: 'GET',
        timeout: 50000
    }, function (error, response, body) {
          var result = JSON.parse(body).rootCategories;
          for (var i = 0; i < result.length; i++) {
            getCategory(result[i].id);
        }  
});    
}

function getCategory(catalog){
 request({
    uri: 'http://www.pontoslivelo.com.br/rest/model/atg/commerce/catalog/ProductCatalogActor/getCategory?categoryId='+catalog+'&atg-rest-output=json',
    method: 'GET',
    timeout: 50000
}, function (error, response, body) {
    if(body){
        try {
        var result = JSON.parse(body);
        if(result){
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
                        count++;
                        console.log('count', count);
                        console.log('skus[0].gtin', skus[0].gtin);
                        searchDotz(skus[0]);
                    }
                }
            }    
        }
        }
    } catch (e) {
    } 
    }
});    
}

function searchDotz(skus) {
     request({
        uri: 'https://search.dotz.com.br/produtoview/_search',
        method: 'POST',
        headers: [
        {
          name: 'content-type',
          value: 'application/json'
        }
        ],
        json : {
                  "from": 0,
                  "size": 12,
                  "query": {
                    "filtered": {
                      "filter": {
                        "bool": {
                          "must": [
                            {
                              "term": {
                                "codigoEan": skus.gtin
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                },
        timeout: 50000
    }, function (error, response, body) {
        try{
            if(body){
               var hits = body.hits;
            if(hits){
              if(hits.total > 0){
                var source = hits.hits[0]._source;
                if(source){
                    if(!source.precos || !source.precos.preco[0]) return;
                    
                    var nomeLivelo = skus.displayName.replace(',','');

                    while(nomeLivelo.indexOf(',') > 0){
                        nomeLivelo = nomeLivelo.replace(',','');                        
                    }

                    var nomeDotz = source.nomeCompleto.replace(',','');

                    while(nomeDotz.indexOf(',') > 0){
                        nomeDotz = nomeDotz.replace(',','');                        
                    }
                    
                    var data = {
                        ean: skus.gtin,
                        nomeProdutoLivelo: nomeLivelo,
                        idProdutoLivelo: skus.repositoryId,
                        pontosLivelo: skus.listPrice,
                        nomeProdutoDotz: nomeDotz,
                        idProdutoDotz: source.id,
                        pontosDotz: source.precos.preco[0].pontosFinal,
                        precoDotz: source.precos.preco[0].precoVenda,
                    }

                    Comparador.create(data)
                    .then(
                        function(message){
                            console.log('ok');
                        },
                        function(erro){
                            console.error(erro);
                        }
                        );
                }  
        }  
            }
             
            }
            
        }catch(e){
        }                       
    });    
}
