/**
 *	MIT License
 *	Copyright (c) 2024 Lars White
 *
 *	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 *	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 *	THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 *	NetSuite Script ID:		customscript_taco_dunning_email_mrs
**/
/**
 *	Instructions text
 *	This script is intended to be at least slightly modified before using it in a NetSuite
 *	environment. Please read the following instructions.
 *
 *	There are two significant pieces of this script that should be modified before use in
 *	production:
 *	- Which Invoices and which email address(es) will be used?
 *	- What should the contents of the email be?
 *	Both of these default in the code below to being hard-coded. There are clearly marked blocks of
 *	code that can be commented in or out if loading a Saved Search and/or an Email Template is
 *	preferred.
 *	Please note that using a Saved Search with a summary type (ex: Group) would require a bit of a
 *	rewrite in map().
 *
 *	This script is intended to be deployed once for each number of days past due where a reminder
 *	to pay is desired. If reminders are to be sent at 7, 14, 30, and 45 days past due, then 4
 *	different Script Deployments should be created. The Script Deployments should be run once
 *	daily. Running them more than once daily will result in duplicate emails going out.
 *
 *	To install/setup this Script in NetSuite do the following:
 *	- Create a new Script record using this .js file (detailed instructions: https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4489062315.html#Creating-a-Script-Record)
 *	- Create the following Script Parameters:
 *		- Days Past Due
 *			Label:			Days Past Due
 *			ID:				custscript_taco_dunning_email_days
 *			Description:	Enter the number of days after the due date that a payment reminder email is to be sent.
 *			Type:			Integer
 *			Display>Help:	Enter the number of days after the due date that a payment reminder email is to be sent.
 *		- Reply To
 *			Label:			Reply To
 *			ID:				custscript_taco_dunning_email_replyto
 *			Description:	Enter the email address that should be listed as the Reply To address on the emails that will be sent.
 *			Type:			Email Address
 *			Display>Help:	Enter the email address that should be listed as the Reply To address on the emails that will be sent.
 *		- Email Author
 *			Label:			Email Author
 *			ID:				custscript_taco_dunning_email_author
 *			Description:	Populate this field with the Employee that will be associated with sending out these reminders.
 *			Type:			List/Record
 *			List/Record:	Employee
 *			Display>Help:	Select the Employee record that will be associated with sending out these reminders.
 *		- CC List
 *			Label:			CC List
 *			ID:				custscript_taco_dunning_email_cc
 *			Description:	If there is an email address that should always get a copy of these emails, it should be populated here.
 *			Type:			Email Address
 *			Display>Help:	If there is an email address that should always get a copy of these emails, it should be populated here.
 *		--------------------------------
 *		The following two are optional (see above for more details).
 *		- Saved Search (Optional parameter)
 *			Label:			Saved Search
 *			ID:				custscript_taco_dunning_email_search
 *			Description:	Saved Searches used here must include the Invoice "Document Number" and "Name" in the Results.
 *			Type:			List/Record
 *			List/Record:	Saved Search
 *			Display>Help:	Saved Searches used here must include the Invoice "Document Number" and "Name" in the Results.
 *		- Email Template (Optional parameter)
 *			Label:			Email Template
 *			ID:				custscript_taco_dunning_email_template
 *			Description:	The specific email template to be used for the dunning communications goes here.
 *			Type:			List/Record
 *			List/Record:	Email Template
 *			Display>Help:	The specific email template to be used for the dunning communications goes here.
 *		--------------------------------
**/
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/email', 'N/runtime', 'N/search', 'N/render'],
(email, runtime, search, render) => {
	
	loadParameters = () => {
		const curScript = runtime.getCurrentScript();
		let parameters = new Object();
		parameters.daysPastDue = parseInt(curScript.getParameter('custscript_taco_dunning_email_days'));
		parameters.author = parseInt(curScript.getParameter('custscript_taco_dunning_email_author'));
		parameters.replyTo = curScript.getParameter('custscript_taco_dunning_email_replyto');
		parameters.ccList = curScript.getParameter('custscript_taco_dunning_email_cc');
		//--------------------------------
		// Optional parameters (see instructions above)
//		parameters.savedSearchId = parseInt(curScript.getParameter('custscript_taco_dunning_email_search'));
//		parameters.template = parseInt(curScript.getParameter('custscript_taco_dunning_email_template'));
		//--------------------------------
		return parameters;
	}

	sendEmail = (optionsObj) => {
		//--------------------------------
		// Optional Template parameter (see instructions above)
/*		let mergeResult = render.mergeEmail({
			templateId: optionsObj.template,
			entity: {
				type:	'employee',
				id:		optionsObj.author
			},
			recipient: {
				type:	'customer',
				id:		optionsObj.recipient[0]
			},
			supportCaseId: null,
			customRecord: null,
			transactionId: options.invId
		});*/
		//--------------------------------

		//--------------------------------
		// The following requires modification, unless "Taco, Inc." is the appropriate company name for this NetSuite environment.
		let emailSubject = 'Taco, Inc. Invoice Due Reminder';
		let emailBody = '<html><p>This is a reminder that invoice #' + optionsObj.docNum + ' is ' + optionsObj.daysPast + ' days past due.</p><p>Accounts Receivable<br />Taco, Inc.</p></html>';
		//--------------------------------

		let emailOptions = {
			author: optionsObj.author,
			recipients: optionsObj.recipient,
			replyTo: optionsObj.replyTo,
			cc: optionsObj.ccEmails,
			//--------------------------------
			// Optional Template parameter (see instructions above)
//			subject: mergeResult.subject,
//			body: mergeResult.body,
			//--------------------------------
			subject: emailSubject,
			body: emailBody,
			relatedRecords: {
				entityid: optionsObj.recipient[0],
				transactionId: optionsObj.invId
			}
		};
		try {
			// This is where the email is finally sent.
			email.send(emailOptions);
			return true;
		}
		catch(e) {
			let msg = '';
            if (e instanceof nlobjError) {
                msg = e.getCode() + '\n' + e.getDetails();
                log.error({
                    title: 'system error',
                    details: msg
                });
            } else {
                msg = e.toString();
                log.error({
                    title: 'unexpected error',
                    details: msg
                });
            }
			return false;
		}
	}

    getInputData = () => {
		log.audit('Initializing dunning email process...');
		//--------------------------------
		// Optional Saved Search parameter (see instructions above)
//		let searchId = parseInt(runtime.getCurrentScript().getParameter('custscript_taco_dunning_email_search'));
//		let searchObj = search.load({
//			id: searchId
//		});
		//--------------------------------

		//--------------------------------
		// Below is the default way this script identifies Invoices that require a reminder email.
		let daysPastDue = parseInt(runtime.getCurrentScript().getParameter('custscript_taco_dunning_email_days'));
		let searchObj = search.create({
			type: "transaction",
			filters:
			[
				["subsidiary","anyof","37"], 
				"AND", 
				["mainline","is","T"], 
				"AND", 
				["status","anyof","CustInvc:A"], 
				"AND", 
				["formulanumeric: TRUNC(TO_DATE({today})-TO_DATE({duedate}))","equalto",daysPastDue]
			],
			columns:
				[
					search.createColumn({
					name: "trandate",
					sort: search.Sort.ASC
				}),
				"duedate",
				"tranid",
				"entity"
			]
		});
		//--------------------------------
		// The Search is intentionally not run here. NetSuite's Map/Reduce Scripts can pass a Saved Search object directly to map() to avoid the usual result limitations in SuiteScript.
        return searchObj;
    }

    map = (context) => {
		// JSON.parse is used to make the data in context easier to access.
		const searchResult = JSON.parse(context.value);
		const invId 	= searchResult.id;						// Invoice Internal ID
		const cusId 	= searchResult.values.entity.value;		// Customer Internal ID
		const docNum	= searchResult.values.tranid;			// Invoice Document Number

		const mapValObj = {	cusId:	cusId, docNum:	docNum };

        // Write the Invoice Internal ID, Customer Internal ID, and Invoice Document Number to pass the data on to reduce(). The Invoice Internal ID is used as the "key", which will result in one email for each Invoice. The other two pieces of data are bundled up in an object. Note when passing data between map() and reduce() there are only two options (key, values). It isn't possible to expand to (key, values, taco). The "key" is the unique identifier, leaving values as a variable that needs to hold (often) more than one piece of data.
		context.write(invId, mapValObj);
    }

	// The reduce function will send out emails (if possible) for each of the transactions passed from the Saved Search.
	reduce = (context) => {
		const contextValues = JSON.parse(context.values[0]);
		const parameters = loadParameters();
		// Read the Invoice Internal ID.
		const invId = Number(context.key);			// Number() is used to ensure this data is handled correctly later on.
		// Read the Customer Internal ID.
		const cusId = Number(contextValues.cusId);	// Number() is used to ensure this data is handled correctly later on.
		// Read the Invoice Document Number.
		const docNum = contextValues.docNum;

		// Since only 'invoice' and 'creditmemo' transaction types (listed above) have the opportunity to change the transApprovalStatus variable, those are the only two transaction types that will be allowed through this script, given the section that follows.
		// In order to avoid sending duplicate emails out, the list of the main To recipients needs to be set to a variable. This way we can pass the array to the render senction below, and we can pass tha same array to the CC function that looks up CC Contacts. With the main recipients list in tow, it can remove any of repeat email addresses from the CC section.
		let ccEmails = [];
		ccEmails.push(parameters.ccList);

		// The main recipient is assumed here to be found at the Email field on the Customer record. This can be identified by simply passing the Customer Internal ID. Note that it needs to be passed in an array though.
		let cusEmail = [];
		cusEmail.push(cusId);

		let emailSent = sendEmail({
			//--------------------------------
			// Optional parameter (see instructions above)
//			template:	parameters.template,
			//--------------------------------
			invId:		invId,
			docNum:		docNum,
			recipient:	cusEmail,
			author: 	parameters.author,
			replyTo: 	parameters.replyTo,
			ccEmails:	ccEmails,
			daysPast:	parameters.daysPastDue
		});

		if(emailSent) {
			log.audit('reduce(): emailSent',emailSent);
		}
		else {
			// There are many reasons an email may not get sent. The most common issue is that there are no valid addresses/recipients.
		}
	}

	// The summarize function is included mostly just so there is an end date/time in NetSuite Map/Reduce Script Status after is complete.
    summarize = (summary) => {
		// This is intentionally (mostly) empty.
		log.audit('Dunning email process complete');
	}

    return {
        getInputData: getInputData,
        map: map,
		reduce: reduce,
		summarize: summarize
    };
});