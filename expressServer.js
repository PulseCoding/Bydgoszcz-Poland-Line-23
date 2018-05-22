var express = require('express'),
		app = express();

app.use('/main.html',express.static('./main.html'));
app.use('/assets',express.static('./assets'));

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/login.html');
});

app.listen(40000);
