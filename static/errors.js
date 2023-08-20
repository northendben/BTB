// function errorHandler(fn) {
//     console.log('i am the handler')
// 	return function (req, res, next) {
// 		fn(req, res, next).catch(e => next(e));
// 	};
// }

// module.exports = errorHandler

function errorHandlerWrapper(fn){
    return function(req,res,next){
        fn(req,res,next).catch(e => next(e))
    }
}
module.exports = errorHandlerWrapper
