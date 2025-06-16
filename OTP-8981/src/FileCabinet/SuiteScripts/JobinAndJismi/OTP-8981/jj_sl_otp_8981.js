/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
/*************************************************************************************
 *
 *
 * ${OTP-8981} : ${Custom form to store blood donor details and track them in database}
 *
 *
 **************************************************************************************
 *
 * Author: Jobin and Jismi IT Services
 *
 * Date Created : 09-June-2025
 *
 * Description : This script is for creating a custom form, which accepts the details of
 * potential blood donors with fields for entering the donor name,(first name,last name),
 * gender, phone number,blood group and last donation date.A custom record type should
 * be created in NetSuite to store the data received through the form.
 *
 * REVISION HISTORY
 *
 * @version 1.0   : 09-June-2025 : The initial build was created by JJ0401
 *
 *
 *************************************************************************************/
define(["N/log", "N/record", "N/ui/serverWidget", "N/search"]
/**
 * @param{log} log
 * @param{record} record
 * @param{serverWidget} serverWidget
 */, (log, record, serverWidget, search) => {
  /**
   * Defines the Suitelet script trigger point.
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request - Incoming request
   * @param {ServerResponse} scriptContext.response - Suitelet response
   * @since 2015.2
   */
  const onRequest = (scriptContext) => {
    try {
      if (scriptContext.request.method === "GET") {
        formCreation(scriptContext);
      }
      if (scriptContext.request.method === "POST") {
        recordCreation(scriptContext);
      }
    } catch (e) {
      log.error("Error caught", e.message);
    }

    /**
     * Function to create a custom form to enter the blood donor details
     * @param
     * @returns {void}
     */
    function formCreation() {
      try {
        let form = serverWidget.createForm({
          title: "Blood Requirement Registration Form",
        });

        form.clientScriptFileId = 24204;

        let fstNameField = (form.addField({
          id: "custpage_fst_name",
          type: serverWidget.FieldType.TEXT,
          label: "First Name",
        }).isMandatory = true);

        let lastNameField = (form.addField({
          id: "custpage_lst_name",
          type: serverWidget.FieldType.TEXT,
          label: "Last Name",
        }).isMandatory = true);

        let genderField = (form.addField({
          id: "custpage_gender",
          type: serverWidget.FieldType.SELECT,
          label: "Gender",
          source: "customlist_jj_gender",
        }).isMandatory = true);

        let phoneNoField = (form.addField({
          id: "custpage_phn_no",
          type: serverWidget.FieldType.PHONE,
          label: "Phone Number",
        }).isMandatory = true);

        let lastDonationDayField = (form.addField({
          id: "custpage_last_donation",
          type: serverWidget.FieldType.DATE,
          label: "Last Donation Date",
        }).isMandatory = true);

        let bloodGrpField = (form.addField({
          id: "custpage_bld_grp",
          type: serverWidget.FieldType.SELECT,
          label: "Blood Group",
          source: "customlist_jj_blood_grp",
        }).isMandatory = true);

        form.addSubmitButton({
          label: "Submit Donor data",
        });

        scriptContext.response.writePage({
          pageObject: form,
        });
      } catch (e) {
        log.error("Error caught", e.message);
      }
    }

    /**
     * Function to create a custom record with the data received through the form
     * @param
     * @returns {void}
     */
    function recordCreation(scriptContext) {
      try {
        let firstName = scriptContext.request.parameters.custpage_fst_name;

        let lastName = scriptContext.request.parameters.custpage_lst_name;

        let gender = scriptContext.request.parameters.custpage_gender;

        let phoneNumber = scriptContext.request.parameters.custpage_phn_no;

        let bloodGroup = scriptContext.request.parameters.custpage_bld_grp;

        let lastDonationDay =
          scriptContext.request.parameters.custpage_last_donation;

        let newDate = convertDate(lastDonationDay);

        let duplicate = checkDuplicate(firstName, lastName, phoneNumber);

        if (duplicate != "") {
          let form = serverWidget.createForm({
            title: "Blood Donor Registration",
          });

          let resultField = (form.addField({
            id: "custpage_display_result",
            type: serverWidget.FieldType.INLINEHTML,
            label: "Text",
          }).defaultValue = `<div> 
                    <p>Sorry, this donor already exists !</p>
                 </div>
                `);
          scriptContext.response.writePage({
            pageObject: form,
          });
        } else {
          let form = serverWidget.createForm({
            title: "Blood Donor Registration",
          });

          let resultField = (form.addField({
            id: "custpage_display_result",
            type: serverWidget.FieldType.INLINEHTML,
            label: "Record Created !",
          }).defaultValue = `<div>
                    <h1>Donor Details </h1>
                    <p>First Name :${firstName}</p>
                    <p>Last Name :${lastName}</p>
                    <p>Gender :${gender}</p>
                    <p>Phone Number :${phoneNumber}</p>
                    <p>Blood Group :${bloodGroup}</p>
                    <p>Last Donation Date :${lastDonationDay}</p>
                </div>
                `);
          let bloodRequirementRecord = record.create({
            type: "customrecord_jj_blood_requirement",
            isDynamic: true,
          });

          bloodRequirementRecord.setValue({
            fieldId: "custrecord_jj_fst_name",
            value: firstName,
          });
          bloodRequirementRecord.setValue({
            fieldId: "custrecord_jj_lst_name",
            value: lastName,
          });
          bloodRequirementRecord.setValue({
            fieldId: "custrecord_jj_blood_donor_gender",
            value: gender,
          });
          bloodRequirementRecord.setValue({
            fieldId: "custrecord_jj_donor_phn_no",
            value: phoneNumber,
          });
          bloodRequirementRecord.setValue({
            fieldId: "custrecord_jj_bld_grp",
            value: bloodGroup,
          });
          bloodRequirementRecord.setValue({
            fieldId: "custrecord_jj_last_bld_donation_date",
            value: newDate,
          });

          bloodRequirementRecord.save({
            ignoreMandatoryFields: true,
          });

          scriptContext.response.writePage({
            pageObject: form,
          });
        }
      } catch (e) {
        log.error("Error caught", e.message);
      }
    }

    /**
     * Function to show an alert
     * @param {string} message - the message that needs to be alerted
     * @returns {void}
     */
    function checkDuplicate(fname, lname, phn) {
      let duplicateSearch = search.create({
        type: "customrecord_jj_blood_requirement",
        title: "Search for duplicate donors JJ",
        id: "_jj_donor_duplicates",
        filters: [
          ["custrecord_jj_fst_name", "is", fname],
          "AND",
          ["custrecord_jj_lst_name", "is", lname],
          "AND",
          ["custrecord_jj_donor_phn_no", "is", phn],
        ],
        columns: [
          search.createColumn({
            name: "custrecord_jj_fst_name",
            label: "First Name",
          }),
          search.createColumn({
            name: "custrecord_jj_lst_name",
            label: "Last Name",
          }),
        ],
      });

      let fullName = "";

      duplicateSearch.run().each(function (result) {
        let firstname = result.getValue({ name: "custrecord_jj_fst_name" });
        let lastname = result.getValue({ name: "custrecord_jj_lst_name" });
        fullName = firstname + " " + lastname;
      });

      return fullName;
    }

    /**
     * Function to convert a date into standard date format of NetSuite
     * @param {date} - the date that needs to be converted
     * @returns {dateObj} - the formatted date
     */
    function convertDate(date) {
      try {
        let dateObj = new Date(date);
        let month = dateObj.getMonth() + 1;
        let day = dateObj.getDate() + 1; // Correct method for day of the month
        let year = dateObj.getFullYear();

        let newMonth = month < 10 ? "0" + month.toString() : month.toString();
        let newDay = day < 10 ? "0" + day.toString() : day.toString();

        let newdate = [year, newMonth, newDay].join("-"); // Correct format
        let formattedDate = new Date(newdate);

        return formattedDate;
      } catch (e) {
        log.error("Error caught", e.message);
      }
    }
  };
  return { onRequest };
});
