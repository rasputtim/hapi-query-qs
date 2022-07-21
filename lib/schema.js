const Joi  = require('joi');
const Hoek = require('@hapi/hoek');

// Internals
const internals = {};


  /**
 * Assert that the params are valid for the type passed in
 *
 * @param type    - The type of object we want to validate for. i.e. route, plugin
 * @param options  - The JSON object to be validated
 * @param message  - Part of the message if validation fails
 * @returns {*}
 */
exports.assert = function (type, options, message) {

    const validationObj = internals[type].validate(options);
    let error           = validationObj.error;
    let errorMessage    = null;
  
    // If there is an error, build a nice error message
    if (error) {
      errorMessage = error.name + ':';
      error.details.forEach(function (err) {
        errorMessage += ' ' + err.message;
      });
    } else {
     
    
  
    }
  
    // If there is an error build the error message
    Hoek.assert(!error, 'Invalid', type, 'options', message ? '(' + message + ')' : '', errorMessage);
  
    return validationObj.value;
  };
  
  
  /**
   * Validation rules for the plugin's params
   */
  internals.plugin = Joi.object({
    ignoredKeys: Joi.array().items(Joi.string()).optional(),
    defaultEnabled: Joi.boolean().optional()
}).options({ allowUnknown: false });