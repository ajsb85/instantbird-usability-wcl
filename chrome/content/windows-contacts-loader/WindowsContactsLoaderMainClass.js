/************************************************************************
The contents of this file are Subject of the GNU GENERAL PUBLIC LICENSE 

FileName:   WindowsContactsLoaderMainClass.js
Version:    V0.3.9
Date:       2014-01-07
Author original:     Andreas Schaller	email: schallera72@gmail.com
Contributor:		Alexander Salas	 email: alexander.salas@gmail.com

*************************************************************************/



var WindowsContactsLoaderMainClass = {

	ShowMenuItem: false,
	Ready: false, 		
	
	OnLoad: function(event)
	{
		var service = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
		var StringBundle = service.createBundle("chrome://windows-contacts-loader" + "/locale" + "/windows-contacts-loader.properties");
		var runningVista = false;
				
		try
		{
			var wrk = Components.classes["@mozilla.org/windows-registry-key;1"]
				.createInstance(Components.interfaces.nsIWindowsRegKey);
			wrk.open(wrk.ROOT_KEY_LOCAL_MACHINE,
							 "Software\\Microsoft\\Windows NT\\CurrentVersion",
							 wrk.ACCESS_READ);
			var id = wrk.readStringValue("CurrentVersion");
			runningVista = (id && id.indexOf("6.") == 0);
			wrk.close();
		}
		catch(err)
		{
			dump(err);
		}	
		if (runningVista)
		{
			this.ShowMenuItem = true;
			this.Ready = true;
			this.SetupUI();
			if (WindowsContactsLoaderPreferences.startOnLoad == true || WindowsContactsLoaderPreferences.startOnDay == true)
			{
				this.LoadContacts();
			}
		}	
	},
	
	SetupUI: function()
	{
		if (this.ShowMenuItem)
		{
			var menuItem = document.getElementById("windows-contact-loader-menuitem");
			menuItem.setAttribute("collapsed", "false");			
		}			
	},
	
	LoadContacts: function()
	{
		var dirName = WindowsContactsLoaderPreferences.getContactDirectory();
		if (dirName && this.Ready) {
			var dir = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsIFile);
			dir.initWithPath(dirName);
			dir = dir.QueryInterface(Components.interfaces.nsIFile);
			//WindowsContactsLoaderClass.LoadContactsFromDir(dir);
			jsdump(dir);
		}		
	}
}

window.addEventListener("load", function(e) { WindowsContactsLoaderMainClass.OnLoad(); }, false);

function jsdump(str) {
  Components.classes['@mozilla.org/consoleservice;1']
            .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage(str);
}
