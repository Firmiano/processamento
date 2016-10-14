'use strict';

var mongoose = require('mongoose');

module.exports = function() {

    var comparador = new mongoose.Schema({
    	ean: String,
        nomeProdutoLivelo: String,
        idProdutoLivelo: String,
        pontosLivelo: Number,
        nomeProdutoDotz: String,
        idProdutoDotz: String,
        pontosDotz: Number,
        precoDotz: Number
    });

    return mongoose.model('Comparador', comparador);
}

