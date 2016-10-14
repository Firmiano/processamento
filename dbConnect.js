'use strict';

var mongoose = require('mongoose');
var single_connection;

var eventApplicationClose = function(){
	process.on('SIGINT', function(){
		mongoose.connection.close(function(){
		console.log('Mongoose! Desconectado pelo término da aplicação');
		process.exit(0);
		});
	})
};

module.exports = function(uri){
	
	//mongoose.set('debug', true);

	if(!single_connection){
		mongoose.Promise = global.Promise;
		single_connection = mongoose.connect(uri);
		mongoose.connection.on('connected',function(){
			console.log('Mongoose! Conectado em ' + uri);
		});
		mongoose.connection.on('discinnected',function(){
			console.log('Mongoose! Descinectado de ' + uri);
		});
		mongoose.connection.on('error',function(erro){
			console.log('Mongoose! Erro na conexão ' + erro);
		});
	}

	eventApplicationClose();

	return single_connection;
	
};