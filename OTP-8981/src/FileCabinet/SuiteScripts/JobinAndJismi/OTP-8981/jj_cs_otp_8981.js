/** 
 * @NApiVersion 2.1 
 * @NScriptType ClientScript 
 * @NModuleScope SameAccount 
 */ 
/*************************************************************************************
 *********** 
 *  
 *  
 * ${OTP-8981} : ${Custom form to store blood donor details and track them in database} 
 * 
 * 
**************************************************************************************
 * 
 * Author: Jobin and Jismi IT Services 
 * 
 * Date Created : 01-August-2022 
 * 
 * Description : This script is for creating a custom form, which accepts the details of
 * potential blood donors with fields for entering the donor name,(first name,last name),
 * gender, phone number,blood group and last donation date.A custom record type should
 * be created in NetSuite to store the data received through the form.
 * 
 * REVISION HISTORY 
 * 
 * @version 1.0  16-June-2025 :  The initial build was created by JJ0401 
 *   
 * 
 * 
 *************************************************************************************/ 
define(["N/log", "N/record"], 
 /**
 * @param{log} log
 * @param{record} record
 */ function (log, record) {
  /**
   * Validation function to be executed when field is changed.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
   * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
   *
   * @returns {boolean} Return true if field is valid
   *
   * @since 2015.2
   */
  var lastValidationTime = 0;
  var validationDelay = 3000; // 3 seconds

  function validateField(scriptContext) {
    try {
      if (scriptContext.fieldId === "custpage_last_donation") {
        dateManipulation(scriptContext);
      }
      if (scriptContext.fieldId === "custpage_phn_no") {
        phoneManipulation(scriptContext);
      }

      return true;
    } catch (e) {
      console.log("Error caught", e.message);
    }
  }

  /**
   * Function to validate the last donation date
   * @param {object}  scriptContext
   * @returns {boolean}
   */
  function dateManipulation(scriptContext) {
    try {
      var currentTime = new Date().getTime();

      if (currentTime - lastValidationTime < validationDelay) {
        return true; // Skip validation if delay has not elapsed
      }

      lastValidationTime = currentTime; // Update the timestamp

      var today = new Date();
      var lastdonationDate = scriptContext.currentRecord.getValue({
        fieldId: "custpage_last_donation",
      });

      if (lastdonationDate > today) {
        alert("A donor cannot be saved with a future last donation date!");
        scriptContext.currentRecord.setValue({
          fieldId: "custpage_last_donation",
          value: "",
        });
        return false;
      }

      return true;
    } catch (e) {
      console.log("Error caught", e.message);
    }
  }

  /**
   * Function to validate the phone number
   * @param {object}  scriptContext
   * @returns {boolean}
   */
  function phoneManipulation(scriptContext) {
    try {
      var currentTime = new Date().getTime();

      if (currentTime - lastValidationTime < validationDelay) {
        return true; // Skip validation if delay has not elapsed
      }

      lastValidationTime = currentTime; // Update the timestamp

      var phoneNo = scriptContext.currentRecord.getValue({
        fieldId: "custpage_phn_no",
      });

      var isValid = phoneNumberCheck(phoneNo);

      if (phoneNo.length != 10 || !isValid) {
        alert(
          "Phone number must have 10 digits and should not include alphabets and special characters!"
        );
        scriptContext.currentRecord.setValue({
          fieldId: "custpage_phn_no",
          value: "",
        });
        return false;
      }

      return true;
    } catch (e) {
      console.log("Error caught", e.message);
    }
  }

  /**
   * Function to show an alert
   * @param {string} phone - the phone number that needs to be validated
   * @returns {boolean}
   */
  function phoneNumberCheck(phone) {
    try {
      return /^\d{10}$/.test(phone);
    } catch (e) {
      console.log("Error caught", e.message);
    }
  }

  return {
    validateField: validateField,
  };
});
