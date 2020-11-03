var http = require('http')
var fs = require('fs')
var path = require('path')
var url = require('url')

http.createServer(function (request, response) {
	console.log('request starting...')
	const parsedUrl = url.parse(request.url)
	var pathname = parsedUrl.pathname;
	var filePath = '.' + pathname
	if (filePath == './')
		filePath = './index.html'

	var extname = path.extname(pathname)
	var contentType = 'text/html'
	switch (extname) {
		case '.js':
		contentType = 'text/javascript'
		break
		case '.css':
		contentType = 'text/css'
		break
		case '.json':
		contentType = 'application/json'
		break
		case '.png':
		contentType = 'image/png'
		break      
		case '.jpg':
		contentType = 'image/jpg'
		break
	}

	fs.readFile(filePath, function(error, content) {
		if (error) {
			if(error.code == 'ENOENT'){
				fs.readFile(path.join("_output", filePath), function(error, content) {
					if(error === null){
						response.writeHead(200, { 'Content-Type': contentType })
						response.end(content, 'utf-8')
					} else {
						response.writeHead(404)
						response.end('File not found: '+error.code+' ..\n')
						response.end() 
					}
				})
			} else if(error.code == 'EISDIR'){
				if (path.extname(filePath).length == 0){
					fs.readFile(path.join(filePath, "index.html"), function(error, content) {
						if (error === null){
							response.writeHead(200, { 'Content-Type': contentType })
							response.end(content, 'utf-8')
						} else {
							response.writeHead(404)
							response.end('File not found: '+error.code+' ..\n')
							response.end() 
						}	
					})
				} else {
					response.writeHead(404)
					response.end('File not found: '+error.code+' ..\n')
					response.end()
				}
			}
			else {
				response.writeHead(500)
				response.end('Sorry, check with the site admin for error: '+error.code+' ..\n')
				response.end() 
			}
		}
		else {
			response.writeHead(200, { 'Content-Type': contentType })
			response.end(content, 'utf-8')
		}
	})

}).listen(9091)
console.log('Server running at http://127.0.0.1:9091/')