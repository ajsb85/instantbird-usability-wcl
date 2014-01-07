/************************************************************************
The contents of this file are Subject of the GNU GENERAL PUBLIC LICENSE 

FileName:   WindowsContactsLoaderPreferences.js
Version:    V0.3.9
Date:       2014-01-07
Author original:     Andreas Schaller	email: schallera72@gmail.com
Contributor:		Alexander Salas	 email: alexander.salas@gmail.com

*************************************************************************/

Components.utils.import("resource://gre/modules/AddonManager.jsm");

var WindowsContactsLoaderAddOnListener = {			
	
}

var WindowsContactsLoaderPreferences = {	
	
	// Initialize the extension	
	startup: function()
	{		
		this.defaultPrefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getDefaultBranch("extensions.WindowsContactsLoader.");
		this.defaultPrefs.QueryInterface(Components.interfaces.nsIPrefBranch);
		
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.WindowsContactsLoader.");
		this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch);
		this.prefs.addObserver("", this, false);              
		
		AddonManager.addAddonListener(WindowsContactsLoaderAddOnListener);	
		
		//get Default Preferences
		try
		{	
			this.defContactDir = this.getDefDirectory();
			this.defAddrBook = this.defaultPrefs.getCharPref("addrBook");
			this.defOnLoad = this.defaultPrefs.getBoolPref("startOnLoad");
			this.defOnStart = this.defaultPrefs.getBoolPref("clearOnStart");
			this.defScheduleDays = this.defaultPrefs.getIntPref("scheduleDays");			
		}
		catch (err)
		{						
			dump(err);				
		}			
		
		// get Preferences		
		try 
		{		
			
			this.contactDir   = this.prefs.getCharPref("contactDir");
			// if contacts dir is initial (first time) set manually
			if ( this.contactDir == "") 
			{
				this.contactDir = this.defContactDir;
				this.prefs.setCharPref("contactDir", this.defContactDir);
				// open options-window at first time.
				window.open("chrome://windows-contacts-loader/content/options.xul", "Windows-Contacts-Loader Options", "chrome");				
			}
			this.addressBook  = this.prefs.getCharPref("addrBook");
			this.startOnLoad  = this.prefs.getBoolPref("startOnLoad");
			this.clearOnStart = this.prefs.getBoolPref("clearOnStart");

			this.scheduleDays = this.prefs.getIntPref("scheduleDays");
			
			if (document.title == "Windows-Contacts-Loader Options")
			{ 
				this.setScheduleDays();
			}
			
			var myDate = new Date();
			this.dayNow = myDate.getDay();
			
			
			if ((this.scheduleDays & Math.pow(2, this.dayNow)) != 0)
			{
				this.startOnDay = true;
			}	
		}
		catch (err)
		{
			// set Default if failed
			dump(err);
			this.contactDir = this.defContactDir;
			this.addressBook = this.defAddrBook;
			this.startOnLoad = this.defOnLoad;
			this.clearOnStart = this.defOnStart;
			this.scheduleDays = this.defScheduleDays;			
		}		
		
	},
	
	// Clean up after ourselves and save the prefs	
	shutdown: function()
	{
		this.prefs.removeObserver("", this);		
		AddonManager.removeAddonListener(WindowsContactsLoaderAddOnListener);
	},
	
	disableElementById: function(Id)
	{
		document.getElementById(Id).setAttribute('disabled','true');		
	},
	
	onChangeCD: function()
	{
		this.disableElementById('reset');
		this.disableElementById('getdir');
		this.contactDir = getElementById("contact_directory").value; 
	},
	
	onChangeAB: function()
	{
		this.disableElementById('reset');		
		this.addressBook = getElementById("address_book").value; 
	},
	
	// Called when events occur on the preferences	
	observe: function(subject, topic, data)
	{
		if (topic != "nsPref:changed")
		{
			return;
		}		

		switch(data)
		{
			case "contactDir":				
				this.contactDir = this.prefs.getCharPref("contactDir");
				this.check();				
				break;
				
			case "addrBook":
				this.addressBook = this.prefs.getCharPref("addrBook");
				this.check();
				break;
				
			case "startOnLoad":
				this.startOnLoad = this.prefs.getBoolPref("startOnLoad");
				if (this.startOnLoad == true)
				{
					this.scheduleDays = 0;
					this.setScheduleDays();
				}
				break;
				
			case "clearOnStart":
				this.clearOnStart = this.prefs.getBoolPref("clearOnStart");
				break;
		}
	},
	
	reset: function()
	{	
		try
		{					
					
			this.prefs.setCharPref("contactDir", this.defContactDir);					
			this.prefs.setCharPref("addrBook", this.defAddrBook);
			this.prefs.setBoolPref("clearOnStart", this.defOnStart);			
			this.prefs.setBoolPref("startOnLoad", this.defOnLoad);
			
			document.getElementById("wclMon").setAttribute('checked','false');
			document.getElementById("wclTue").setAttribute('checked','false');
			document.getElementById("wclWed").setAttribute('checked','false');
			document.getElementById("wclThu").setAttribute('checked','false');
			document.getElementById("wclFri").setAttribute('checked','false');
			document.getElementById("wclSat").setAttribute('checked','false');
			document.getElementById("wclSun").setAttribute('checked','false');
			this.prefs.setIntPref("scheduleDays", this.defScheduleDays);
		}
		catch(err)
		{
			dump(err);
		}
	},
	
	check: function()
	{
		if (this.contactDir == "" && this.defContactDir != "")
		{
			this.prefs.setCharPref("contactDir", this.defContactDir);
		}
			if (this.addressBook == "" && this.defAddrBook != "")
		{
			this.prefs.setCharPref("addrBook", this.defAddrBook);
		}		
	},
	
	openFileDialog: function()
	{
		const nsIFilePicker = Components.interfaces.nsIFilePicker;
		try
		{
			var fp = Components.classes["@mozilla.org/filepicker;1"].getService(Components.interfaces.nsIFilePicker);						
			fp.init(window, "Dialog Title", nsIFilePicker.modeGetFolder);
			fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

			var rv = fp.show();
			if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace)
			{
				var file = fp.file;		
				var path = fp.file.path;
				this.prefs.setCharPref("contactDir", path);
			}
		}
		catch (err)
		{
			dump(err);
		}
	},
	
	getDefDirectory: function()
	{
		var Dir = null;
		var env = Components.classes["@mozilla.org/process/environment;1"]
			.createInstance(Components.interfaces.nsIEnvironment);
		if (env.exists("USERPROFILE"))
		{
			Dir = env.get("USERPROFILE");
			Dir = Dir + "\\Contacts";
		}
		return Dir;		
	},
	
	getContactDirectory: function()
	{
		if ( this.contactDir == "")
		{
			return this.defContactDir;
		}
		else
		{
			return this.contactDir;
		}
	},
	
	setScheduleDays: function()
	{
		if ((this.scheduleDays & 2)   != 0) { document.getElementById("wclMon").setAttribute('checked','true'); }
		if ((this.scheduleDays & 4)   != 0) { document.getElementById("wclTue").setAttribute('checked','true'); }
		if ((this.scheduleDays & 8)   != 0) { document.getElementById("wclWed").setAttribute('checked','true'); }
		if ((this.scheduleDays & 16)  != 0) { document.getElementById("wclThu").setAttribute('checked','true'); }
		if ((this.scheduleDays & 32)  != 0) { document.getElementById("wclFri").setAttribute('checked','true'); }
		if ((this.scheduleDays & 64)  != 0) { document.getElementById("wclSat").setAttribute('checked','true'); }
		if ((this.scheduleDays & 128) != 0) { document.getElementById("wclSun").setAttribute('checked','true'); }
	},
	
	checkDays: function(idName)
	{
		//document.getElementById( idName.id ).setAttribute('style','color: #0000E0');
		
		if(idName.checked == true) 
		{
			this.prefs.setBoolPref("startOnLoad", false);
			switch(idName.id)
			{
				case "wclMon": this.scheduleDays = this.scheduleDays | 2; break;
				case "wclTue": this.scheduleDays = this.scheduleDays | 4; break;
				case "wclWed": this.scheduleDays = this.scheduleDays | 8; break;
				case "wclThu": this.scheduleDays = this.scheduleDays | 16; break;
				case "wclFri": this.scheduleDays = this.scheduleDays | 32; break;
				case "wclSat": this.scheduleDays = this.scheduleDays | 64; break;
				case "wclSun": this.scheduleDays = this.scheduleDays | 128; break;
								
			}
		}
		else
		{
			switch(idName.id)
			{
				case "wclMon": this.scheduleDays = this.scheduleDays & 0xFD; break;
				case "wclTue": this.scheduleDays = this.scheduleDays & 0xFB; break;
				case "wclWed": this.scheduleDays = this.scheduleDays & 0xF7; break;
				case "wclThu": this.scheduleDays = this.scheduleDays & 0xEF; break;
				case "wclFri": this.scheduleDays = this.scheduleDays & 0xDF; break;
				case "wclSat": this.scheduleDays = this.scheduleDays & 0xBF; break;
				case "wclSun": this.scheduleDays = this.scheduleDays & 0x7F; break;			
			}
		}		
		this.prefs.setIntPref("scheduleDays", this.scheduleDays);		
	},	
}

window.addEventListener("load", function(e) { WindowsContactsLoaderPreferences.startup(); }, false);
window.addEventListener("unload", function(e) { WindowsContactsLoaderPreferences.shutdown(); }, false);

