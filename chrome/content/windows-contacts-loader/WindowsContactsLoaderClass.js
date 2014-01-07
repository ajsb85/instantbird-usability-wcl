/************************************************************************
The contents of this file are Subject of the GNU GENERAL PUBLIC LICENSE *

FileName:   WindowsContactsLoaderClass.js
Version:    V0.3.9
Date:       2014-01-07
Author original:     Andreas Schaller	email: schallera72@gmail.com
Contributor:		Alexander Salas	 email: alexander.salas@gmail.com

*************************************************************************/

const PABDIRECTORY = 2;

var WindowsContactsLoaderClass = {

	GetItems: function(root, collection, node, label) {
		var items = new Array();		
		var k = 0;		
		try {
			label.length;
		}
		catch(e) {
			label = new Array();
		}		
		for ( var i = 0; i < root.length; i++) {
			var myNode = root[i];
			try {
				var myCollection;
				if ( collection != "c:contact" ) {
					var collectionList = myNode.getElementsByTagName(collection);
					myCollection = collectionList.item(0);
				}				
				else {
					myCollection = myNode;
				}
				var itemList = myCollection.getElementsByTagName(node);				
				for ( var j = 0; j < itemList.length; j++) {				
					var parent = itemList.item(j).parentNode;
					var labelCollection = parent.getElementsByTagName("c:Label");
					var n = labelCollection.length;
					if ( (n == 0 && label.length == 0) || collection == "c:contact" || collection == "c:PhotoCollection" )
					{
						items[k++] = itemList.item(j).textContent;
						n = 0;
					}								
					if ( n > 0 ) {
						for ( var m = 0; m < labelCollection.length; m++) {
								var myLabel = labelCollection.item(m);
								if(labelCollection.length > 0) {
									for ( var o = 0; o < label.length; o++) {
									if ( myLabel.textContent == label[o] ) n--;
									}
								}
							}
						if ( n == 0 ) {
							items[k++] = itemList.item(j).textContent;
						}
					}					
				}
			}
			catch(e) {
				dump(e);
			}
		}
		return items;
	},
	
	GetRootOfFile: function(file) {
		var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
		fstream.init(file, -1, 0, 0);
		sstream.init(fstream);
		var parser = new DOMParser();	
		var doc = parser.parseFromStream(fstream,'utf-8', sstream.available(),'text/xml');
		sstream.close();
		fstream.close();		
		return doc.childNodes;		
	},
	
	FillAbCard: function(card, tag, nodes) {	
		var items = this.GetItems( nodes, tag.collection, tag.node, tag.label);
		try
		{
			card.setProperty(tag.property, items[0]);
		}
		catch(e) {
			dump(e);
		}
	},
	
	GetAbCardFromContactFile: function(file) {
		var allNodes = this.GetRootOfFile(file);
		var abCard = Components.classes["@mozilla.org/addressbook/cardproperty;1"].createInstance(Components.interfaces.nsIAbCard);
		var tags = new Array();
		
		// NameCollection
		tags[0] = { property:"FirstName", collection:"c:NameCollection", node:"c:GivenName", label:[]};
		tags[1] = { property:"LastName", collection:"c:NameCollection", node:"c:FamilyName", label:[]};
		tags[2] = { property:"DisplayName", collection:"c:NameCollection", node:"c:FormattedName", label:[]};
		tags[3] = { property:"NickName", collection:"c:NameCollection", node:"c:NickName", label:[]};	
		tags[4] = { property:"Custom2", collection:"c:NameCollection", node:"c:Title", label:[]};
		// EmailAddressCollection
		tags[5] = {	property:"PrimaryEmail", collection:"c:EmailAddressCollection", node:"c:Address", label:["Preferred"]};
		tags[6] = { property:"SecondEmail", collection:"c:EmailAddressCollection", node:"c:Address", label:[]};
		// contact & ContactID
		tags[7] = { property:"Notes", collection:"c:contact", node:"c:Notes", label:[]};
		tags[8] = { property:"Custom1", collection:"c:contact", node:"c:Gender", label:[]};
		tags[9] = { property:"Custom4", collection:"c:ContactID", node:"c:Value", label:[]};
		// PhysicalAddressCollection
		tags[10] = { property:"HomeAddress", collection:"c:PhysicalAddressCollection", node:"c:Street", label:["Personal"]};
		tags[11] = { property:"HomeZipCode", collection:"c:PhysicalAddressCollection", node:"c:PostalCode", label:["Personal"]};
		tags[12] = { property:"HomeCity", collection:"c:PhysicalAddressCollection", node:"c:Locality", label:["Personal"]};
		tags[13] = { property:"HomeCountry", collection:"c:PhysicalAddressCollection", node:"c:Country", label:["Personal"]};
		tags[14] = { property:"HomeState", collection:"c:PhysicalAddressCollection", node:"c:Region", label:["Personal"]};
		tags[15] = { property:"WorkAddress", collection:"c:PhysicalAddressCollection", node:"c:Street", label:["Business"]};
		tags[16] = { property:"WorkZipCode", collection:"c:PhysicalAddressCollection", node:"c:PostalCode", label:["Business"]};
		tags[17] = { property:"WorkCity", collection:"c:PhysicalAddressCollection", node:"c:Locality", label:["Business"]};
		tags[18] = { property:"WorkCountry", collection:"c:PhysicalAddressCollection", node:"c:Country", label:["Business"]};
		tags[19] = { property:"WorkState", collection:"c:PhysicalAddressCollection", node:"c:Region", label:["Business"]};
		// PositionCollection
		tags[20] = { property:"WorkAddress2", collection:"c:PositionCollection", node:"c:Office", label:["Business"]};
		tags[21] = { property:"Department", collection:"c:PositionCollection", node:"c:Department", label:["Business"]};
		tags[22] = { property:"JobTitle", collection:"c:PositionCollection", node:"c:JobTitle", label:["Business"]};
		tags[23] = { property:"Company", collection:"c:PositionCollection", node:"c:Company", label:["Business"]};
		// UrlCollection
		tags[24] = { property:"WebPage2", collection:"c:UrlCollection", node:"c:Value", label:["Personal"]};
		tags[25] = { property:"WebPage1", collection:"c:UrlCollection", node:"c:Value", label:["Business"]};	
		// PhoneNumberCollection
		tags[26] = { property:"HomePhone", collection:"c:PhoneNumberCollection", node:"c:Number", label:["Voice", "Personal"]};
		tags[27] = { property:"PagerNumber", collection:"c:PhoneNumberCollection", node:"c:Number", label:["Fax", "Personal"]};	
		tags[28] = { property:"WorkPhone", collection:"c:PhoneNumberCollection", node:"c:Number", label:["Voice", "Business"]};
		tags[29] = { property:"FaxNumber", collection:"c:PhoneNumberCollection", node:"c:Number", label:["Fax", "Business"]};	
		tags[30] = { property:"CellularNumber", collection:"c:PhoneNumberCollection", node:"c:Number", label:["Cellular"]};
		// Others
		tags[31] = { property:"Custom3", collection:"c:Person", node:"c:FormattedName", label:["wab:Spouse"]};
		tags[32] = { property:"", collection:"c:PhotoCollection", node:"c:Value", label:["UserTile"]};
		tags[33] = { property:"", collection:"c:DateCollection", node:"c:Value", label:["wab:Birthday"]};
		
		for ( var i = 0; i < tags.length; i++ ) {
			if ( tags[i].collection == "c:PhotoCollection" ) {
				var encodedPhoto = this.GetItems(allNodes, tags[i].collection, tags[i].node, tags[i].label);				
			}
			else if ( tags[i].collection == "c:DateCollection" ) {
				var birthday = this.GetItems(allNodes, tags[i].collection, tags[i].node, tags[i].label);
			}
			else {				
				this.FillAbCard(abCard, tags[i], allNodes);
			}
		}
		
		if (encodedPhoto[0]) {
			var strPhoto = encodedPhoto[0];
			strPhoto = strPhoto.replace("\n","","g");
			strPhoto = strPhoto.replace("\t","","g");
			var decodedPhoto = atob(strPhoto);
			var cardID = abCard.getProperty("Custom4", false);			
			this.WritePhoto(cardID, decodedPhoto);
			//abCard.setProperty("PhotoType", "generic");
			abCard.setProperty("PhotoType", "file");
			abCard.setProperty("PhotoURI", this.GetPhotoURI(cardID) + ".bmp" );
			abCard.setProperty("PhotoName", cardID + ".bmp" );
		}
		
		if (birthday[0]) {
			var dateofbirth = birthday.toString();
			var year = dateofbirth.slice(0,4);
			var month = dateofbirth.slice(5,7);
			var day = dateofbirth.slice(8,10);
			abCard.setProperty("BirthYear", year);
			abCard.setProperty("BirthMonth", month);
			abCard.setProperty("BirthDay", day);
		}
		
		return abCard;
	},
	
	GetMailListElements: function(directoryID, encodedList) {
		var strList = encodedList;
		strList = strList.replace("\n","","g");
		strList = strList.replace("\t","","g");
		
		var decodedList = atob(strList);
		decodedList = decodedList.replace("\0","","g");
		//decodedList = decodedList.replace("\x04","","g");
		var strArr = decodedList.split("GUID:\"");
		
		var GuidArr = new Array();
		for ( var i = 1; i < strArr.length; i++ ) {
			GuidArr[i-1] = strArr[i].substr(0,36);
		}
				
		return GuidArr;
	},
	
	GetAbDirectoryFromGroupFile: function(file, ab)	{
		var mailList = Components.classes["@mozilla.org/addressbook/directoryproperty;1"].createInstance(Components.interfaces.nsIAbDirectory); 
		try	{	
			var root = this.GetRootOfFile(file);
			var directoryName = (root[0].getElementsByTagName("c:FormattedName"))[0].textContent;
			var directoryID = (root[0].getElementsByTagName("c:ContactID"))[0].textContent;
			var encodedList = (root[0].getElementsByTagName("MSWABMAPI:PropTag0x66001102"))[0].textContent;
			
			var CardGuids = this.GetMailListElements(directoryID, encodedList);
			directoryID = directoryID.replace("\n","","g");
			directoryID = directoryID.replace("\t","","g");
		
			mailList.isMailList = true;		
			mailList.dirName = directoryName;
			mailList.listNickName = directoryID;
		}
		catch (err)	{
			dump(err);
		}
		// get existing MailLists
		var storedML = ab.addressLists;
		var ML = storedML.enumerate();
		while (ML.hasMoreElements()) {
			var myML = ML.getNext().QueryInterface(Components.interfaces.nsIAbDirectory);			
			// if MailLists exists delete it
			if (myML.listNickName == directoryID)
			{
				try {										
					Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager).deleteAddressBook(myML.URI);
				}
				catch (err) {
					dump(err);
				}					
			}			
		}
			
									
		var contactID = new String();	
		for (var i = 0; i < CardGuids.length; i++)	{
			try	{
				contactID = CardGuids[i];
				var card = ab.getCardFromProperty("Custom4", contactID , false);
				if (card && card.primaryEmail != "")
				{
					mailList.addressLists.appendElement(card, false);				
				}
			}
			catch (err) {
				dump(err);
			}
		}
		
		return mailList;
	},
	
	GetLocalAbDirectory: function(dirName) {
		var myDirectory = null;
        var directories = [];
		
		// [AS/07.12.2011] Hint: Components.classes["@mozilla.org/rdf/rdf-service;1"] failed !!!
		var abManager = Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager);
		directories = abManager.directories;
		
		while (directories.hasMoreElements()) {  
            addressBook = directories.getNext().QueryInterface(Components.interfaces.nsIAbDirectory);  
            if (addressBook instanceof Components.interfaces.nsIAbDirectory) {
				if (addressBook.dirName == dirName) {
					myDirectory = addressBook;
				}    
            }  
        }  		
		 
		return myDirectory;
	},
	
	GetAbDirectory: function() {	
		var dirName = WindowsContactsLoaderPreferences.addressBook;	
		try	{	
			var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
			converter.charset = "UTF-8";
			dirName = converter.ConvertToUnicode(dirName);
		}
		catch(err) {
			dump(err)
		}
			
		var directory = this.GetLocalAbDirectory(dirName);
		
		if ( directory != null && WindowsContactsLoaderPreferences.clearOnStart == true )	{		
			var abManager = Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager);
			abManager.deleteAddressBook( directory.URI );
			directory = null;
		}	
		
		if ( directory == null || directory.dirName != dirName ) {
			try	{	
				var abManager = Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager);
				var retCode = abManager.newAddressBook( dirName, "", PABDIRECTORY, "ldap_2.servers." + dirName);				
				
				directory = this.GetLocalAbDirectory(dirName);
			}
			catch (err)	{
				dump(err);
			}
			
		}		
		return directory;
	},
	
	LoadContactsFromDir: function(dir) {
		var allFiles = dir.directoryEntries;
		var cardFiles = [];
		var groupFiles = [];

		while (allFiles.hasMoreElements()) {
			var file = allFiles.getNext().QueryInterface(Components.interfaces.nsIFile);
			var path = file.leafName;
			if (path.search(/\.contact$/i) > 0)
				cardFiles.push(file);
			else if (path.search(/\.group$/i) > 0)
				groupFiles.push(file);
		}
		
		var ab = this.GetAbDirectory();		
		var allCards = [];
		for (var i = 0; i < cardFiles.length; i++) {		
			var abCard = this.GetAbCardFromContactFile(cardFiles[i]);
			var cardID = abCard.getProperty("Custom4", false);
			var cardModifyTime = cardFiles[i].lastModifiedTime;
			var card = ab.getCardFromProperty("Custom4", cardID , false); 
			if (card) {						
				if ( cardModifyTime >= card.getProperty("modified", null)) {
				var cardsToDelete = Components.classes["@mozilla.org/array;1"].createInstance(Components.interfaces.nsIMutableArray);			
				cardsToDelete.appendElement(card, false);
				ab.deleteCards(cardsToDelete);
				var myTime = new Date();
				abCard.setProperty("modified", myTime.getTime());
				allCards.push(ab.addCard(abCard));
				}
			}
			else {
				allCards.push(ab.addCard(abCard));
			}
		}

		for (var i = 0; i < groupFiles.length; i++) {
			var abDirectory = this.GetAbDirectoryFromGroupFile(groupFiles[i], ab);
			ab.addMailList(abDirectory);		
		}	
	},
	
	GetPhotoDir: function() {
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
							.getService(Components.interfaces.nsIProperties)
							.get("ProfD", Components.interfaces.nsIFile);
		// Get the Photos directory
		file.append("Photos");
		if (!file.exists() || !file.isDirectory()) file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
		return file;
	},
	
	GetPhotoURI: function(aPhotoName) {
		var file = this.GetPhotoDir();
		try {
			file.append(aPhotoName);
		}
		catch (e) {
		}		
		return Components.classes["@mozilla.org/network/io-service;1"]
                .getService(Components.interfaces.nsIIOService)
				.newFileURI(file).spec;
    },	
	
	WritePhoto: function(ID, bin) {	
		try	{
			var aFile = Components.classes["@mozilla.org/file/local;1"].
					createInstance(Components.interfaces.nsIFile);			
			var PhotoDir = this.GetPhotoDir();
			var PhotoFile = PhotoDir.path + "\\" + ID +".bmp";
			aFile.initWithPath(PhotoFile);
			try	{
				if ( aFile.exists() ) {
					aFile.remove(true);
				}
				aFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0600);

				var ostream = Components.classes["@mozilla.org/network/file-output-stream;1"].
						createInstance(Components.interfaces.nsIFileOutputStream);
				ostream.init(aFile, 0x04 | 0x08 | 0x20, 0600, 0); // readwrite, create, truncate	
				
				var bstream = Components.classes["@mozilla.org/binaryoutputstream;1"].
								createInstance(Components.interfaces.nsIBinaryOutputStream);
				bstream.setOutputStream(ostream);
				bstream.writeBytes(bin, bin.length)
			}
			catch (e) {
				dump(e);
			}
			finally	{
				bstream.flush();
				bstream.close();
				ostream.close();
			}
		}		
		catch (err) {
			dump(e);
			return;
		}		
	},
}