const errorHandler = (err, req, res, next) => {
	const error = { ...err }
	const errors = {}
    console.log('Error', err)
	if(err.name === 'ValidationError'){
		error.statusCode = 400
		error.message = err.name
        //Joi validation err
        if(err.details) {
            err.errors = err.details
        }
		Object.values(err.errors).forEach(item=>{
			errors[item.path] = item.message
		})
	}

	res.status(error.statusCode || 500).json({
		message: error.message || 'server error',
		errors,
	})
}

module.exports = errorHandler