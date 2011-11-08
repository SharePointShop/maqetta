dojo.provide("davinci.ui.ThemeSetsDialog");

dojo.require("davinci.version");
dojo.require("davinci.repositoryinfo");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
dojo.require("dojo.data.ObjectStore");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");

dojo.require("dojo.date.locale");
dojo.require("dojo.date.stamp");

dojo.declare("davinci.ui.ThemeSetsDialog",   null, {
    
    
    constructor : function(){

        this._connections = [];
       // this._dojoThemeSets = davinci.workbench.Preferences.getPreferences("maqetta.dojo.themesets", davinci.Runtime.getProject());
        var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
        this._dialog = new dijit.Dialog({
            id: "manageThemeSets",
            title: langObj.themeSetsDialog,
            style:"width:510px; ",
            
        });
        dojo.connect(this._dialog, "onCancel", this, "onClose");
        this._dojoThemeSets = davinci.workbench.Preferences.getPreferences("maqetta.dojo.themesets", davinci.Runtime.getProject());
        if (!this._dojoThemeSets){ 
            this._dojoThemeSets =  davinci.theme.dojoThemeSets;
            
        }
        this._dojoThemeSets = dojo.clone(this._dojoThemeSets); // make a copy so we won't effect the real object
        
        this._dialog.attr("content", this._getTemplate());
        this._connections.push(dojo.connect(dojo.byId('theme_select_themeset_theme_select'), "onchange", this, "onChange"));
        this._connections.push(dojo.connect(dojo.byId('theme_select_themeset_theme_select'), "onClick", this, "onClick"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_desktop_theme_select'), "onChange", this, "onDesktopChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_mobile_theme_select'), "onChange", this, "onMobileChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_ok_button'), "onClick", this, "onOk"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_cancel_button'), "onClick", this, "onClose"));
        this.addThemeSets();
        this._selectedThemeSet = this._dojoThemeSets.themeSets[0];
       // var select = dojo.byId('theme_select_themeset_theme_select');
        dijit.byId('theme_select_themeset_theme_select_textbox').attr('value',this._selectedThemeSet.name);
        //select.setAttribute( 'value', this._selectedThemeSet.name);
        this.addThemes(this._selectedThemeSet);
        this._dialog.show();
  
    },
    
    addThemeSets: function(){

       
        /*if (this._selectedThemeSet.name == davinci.theme.none_themeset_name){
            this._dojoThemeSets.themeSets.unshift(this._selectedThemeSet); // temp add to prefs
        } else {
            this._dojoThemeSets.themeSets.unshift(davinci.theme.none_themeset); // temp add to prefs 
        }*/
        //var select = dijit.byId('theme_select_themeset_theme_select');
        var select = dojo.byId('theme_select_themeset_theme_select');
        //var opt = {value: '(none)', label: '(none)'}; // FIXME NLS
        //select.addOption(opt);
        for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
           // opt = {value: this._dojoThemeSets.themeSets[i].name, label: this._dojoThemeSets.themeSets[i].name};
           // select.addOption(opt);
            var c = dojo.doc.createElement('option');
            c.innerHTML = this._dojoThemeSets.themeSets[i].name;
            c.value = this._dojoThemeSets.themeSets[i].name;
            if (i === 0 ) {
                c.selected = '1';
            }
            select.appendChild(c);
        }
        
    },
    
    addThemes: function(themeSet){

        this._themeData = davinci.library.getThemes(davinci.Runtime.getProject(), this.workspaceOnly, true);
        var dtSelect = dijit.byId('theme_select_desktop_theme_select');
        dtSelect.options = [];
        var androidSelect = dijit.byId('theme_select_android_select');
        androidSelect.options = [];
        var blackberrySelect = dijit.byId('theme_select_blackberry_select');
        blackberrySelect.options = [];
        var ipadSelect = dijit.byId('theme_select_ipad_select');
        ipadSelect.options = [];
        var iphoneSelect = dijit.byId('theme_select_iphone_select');
        iphoneSelect.options = [];
        var otherSelect = dijit.byId('theme_select_other_select');
        otherSelect.options = [];
        var mblSelect = dijit.byId('theme_select_mobile_theme_select');
        dtSelect.options = [];
        mblSelect.options = [];
        mblSelect.addOption({value: davinci.theme.default_theme, label: davinci.theme.default_theme});
        //mblSelect.addOption({value: davinci.theme.none_theme, label: davinci.theme.none_theme});
        this._themeCount = this._themeData.length;
        for (var i = 0; i < this._themeData.length; i++){
            var opt = {value: this._themeData[i].name, label: this._themeData[i].name};
            if (this._themeData[i].type === 'dojox.mobile'){
                mblSelect.addOption(opt);
                androidSelect.addOption(opt);
                blackberrySelect.addOption(opt);
                ipadSelect.addOption(opt);
                iphoneSelect.addOption(opt);
                otherSelect.addOption(opt);
            } else {
                dtSelect.addOption(opt);
            }
            
        }
        dtSelect.attr( 'value', themeSet.desktopTheme);
        for (var d = 0; d < themeSet.mobileTheme.length; d++){
            var device = themeSet.mobileTheme[d].device.toLowerCase(); 
            switch (device) {
            case 'android':
                androidSelect.attr( 'value', themeSet.mobileTheme[d].theme);
                break;
            case 'blackberry':
                blackberrySelect.attr( 'value', themeSet.mobileTheme[d].theme);
                break;
            case 'ipad':
                ipadSelect.attr( 'value', themeSet.mobileTheme[d].theme);
                break;
            case 'iphone':
                iphoneSelect.attr( 'value', themeSet.mobileTheme[d].theme);
                break;
            case 'other':
                otherSelect.attr( 'value', themeSet.mobileTheme[d].theme);
                break;
            }
        }
        if (davinci.theme.singleMobileTheme(themeSet)) {
            mblSelect.attr( 'value', themeSet.mobileTheme[themeSet.mobileTheme.length-1].theme);
        } else {
            debugger;
            mblSelect.attr( 'value', davinci.theme.default_theme); 
            this.onMobileChange(davinci.theme.default_theme); //force refresh
        }
        
    },
    
    onClick: function(e) {
        e.target.setAttribute('selected', false);
        var select = dojo.byId('theme_select_themeset_theme_select');
        select.setAttribute( 'value', this._selectedThemeSet.name);
    },
    
    onChange : function(e){
        var name = e.target[e.target.selectedIndex].value;
        for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
            if (this._dojoThemeSets.themeSets[i].name == name) {
                this.addThemes(this._dojoThemeSets.themeSets[i]);
                this._selectedThemeSet = this._dojoThemeSets.themeSets[i];
                dijit.byId('theme_select_themeset_theme_select_textbox').attr('value',this._selectedThemeSet.name);
                break;
            }
         
        }
/*        var mblSelect = dijit.byId('theme_select_mobile_theme_select');
        var dtSelect = dijit.byId('theme_select_desktop_theme_select');
        if (e === davinci.theme.none_themeset_name) {
            mblSelect.set('disabled', false);
            dtSelect.set('disabled', false);
        } else {
            var androidSelect = dijit.byId('theme_select_android_select');
            var blackberrySelect = dijit.byId('theme_select_blackberry_select');
            var ipadSelect = dijit.byId('theme_select_ipad_select');
            var iphoneSelect = dijit.byId('theme_select_iphone_select');
            var otherSelect = dijit.byId('theme_select_other_select');
            
            mblSelect.set('disabled', true);
            dtSelect.set('disabled', true);
            androidSelect.set('disabled', true);
            blackberrySelect.set('disabled', true);
            ipadSelect.set('disabled', true);
            iphoneSelect.set('disabled', true);
            otherSelect.set('disabled', true);
            
        }*/
        
    },
    
    onDesktopChange : function(e){
  
        this._selectedThemeSet.desktopTheme = e;
               
    },
    
    onMobileChange : function(e){
        
        var mblSelect = dijit.byId('theme_select_mobile_theme_select');
        var androidSelect = dijit.byId('theme_select_android_select');
        var blackberrySelect = dijit.byId('theme_select_blackberry_select');
        var ipadSelect = dijit.byId('theme_select_ipad_select');
        var iphoneSelect = dijit.byId('theme_select_iphone_select');
        var otherSelect = dijit.byId('theme_select_other_select');
        
        if ((e === '(device-specific)') /*&&  (this._selectedThemeSet.name === davinci.theme.none_themeset_name)*/) {
            androidSelect.set('disabled', false);
            blackberrySelect.set('disabled', false);
            ipadSelect.set('disabled', false);
            iphoneSelect.set('disabled', false);
            otherSelect.set('disabled', false);
        } else {
            for (var d = 0; d < this._selectedThemeSet.mobileTheme.length; d++){
                var device = this._selectedThemeSet.mobileTheme[d].device.toLowerCase(); 
                this._selectedThemeSet.mobileTheme[d].theme = e;
                switch (device) {
                case 'android':
                    androidSelect.attr( 'value', e);
                    androidSelect.set('disabled', true);
                    break;
                case 'blackberry':
                    blackberrySelect.attr( 'value', e);
                    blackberrySelect.set('disabled', true);
                    break;
                case 'ipad':
                    ipadSelect.attr( 'value', e);
                    ipadSelect.set('disabled', true);
                    break;
                case 'iphone':
                    iphoneSelect.attr( 'value', e);
                    iphoneSelect.set('disabled', true);
                    break;
                case 'other':
                    otherSelect.attr( 'value', e);
                    otherSelect.set('disabled', true);
                    break;
                }
            }
        }
   
        
    },
    
    
    updateDeviceThemes: function(){

        for (var i = 0; i < this._selectedThemeSet.mobileTheme.length; i++){
            var select;
            switch (this._selectedThemeSet.mobileTheme[i].device.toLowerCase()){
            case 'android' :
                select = dijit.byId('theme_select_android_select');
                break;
            case 'blackberry' :
                select = dijit.byId('theme_select_blackberry_select');
                break;
            case 'ipad' :
                select = dijit.byId('theme_select_ipad_select');
                break;
            case 'iphone' :
                select = dijit.byId('theme_select_iphone_select');
                break;
            default :
                select = dijit.byId('theme_select_other_select');
                
            }
            this._selectedThemeSet.mobileTheme[i].theme = select.attr( 'value');
        }

    },
    
    
     onOk: function(e){
  
         davinci.workbench.Preferences.savePreferences("maqetta.dojo.themesets", davinci.Runtime.getProject(),this._dojoThemeSets);
         this.onClose(e);

     },
     
     onClose: function(e){

         while (connection = this._connections.pop()){
             dojo.disconnect(connection);
         }
         this._dialog.destroyDescendants();
         this._dialog.destroy();
         delete this._dialog;
     },
     
      
     onDeleteThemeSet: function(e){

        for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
            if (this._dojoThemeSets.themeSets[i].name === this._currentThemeSet.name){
                var themeName = this._dojoThemeSets.themeSets[i-1].name;
                var cb = dijit.byId('theme_select');
                cb.store.fetchItemByIdentity({
                    identity: this._dojoThemeSets.themeSets[i].name,
                    onItem: function(item){
                        cb.store.deleteItem(item);
                        cb.store.save();
                    }
                });
                this._dojoThemeSets.themeSets.splice(i,1); // removes the theme set from the array 
                this._currentThemeSet = null;
                cb.attr( 'value', themeName); 
                break;
            }
           
        }
        
    },
    
    _getTemplate: function(){
        
        var size = 4;
        if (this._dojoThemeSets.themeSets.length > size) {
            size = this._dojoThemeSets.themeSets.length;
        } 
        if (size > 10) {
            size = 10;
        }

        var template = ''+
            '<table>' +
                '<tr>' +
                    '<td style="width:30%; vertical-align: top;">' +
                        '<table>' + 
                            '<tr>' +
                                '<td style="width:30px; vertical-align: top;" >' +
                                    '<label>Theme sets:</label><select  id="theme_select_themeset_theme_select" name="theme_select_themeset_theme_select" size="'+size+'" style="margin-bottom: 5px;" ></select>'+
                                    '<span style="font-size:18px; margin:5px; border: 1px solid #ccc; border-radius: 2px; color: #ccc; padding: 0px 2px 0 2px;" >+</span><span style="font-size:18px; margin:5px; border: 1px solid #ccc; border-radius: 2px; color: #ccc; padding: 0px 2px 0 2px;">-</span>'+
                                    '</td>' +
                                '<td><div style="border-right: 1px solid #ccc; width: 1px; height: 250px; margin-left: 10px; margin-top: 10px;"></div></td>' +
                            '</tr>' +
                            '<tr>' +
                                '<td></td><td></td>' +
                            '</tr>' +
                        '</table>' +
                    '</td>' +
                    '<td>' +
                        '<table style="width: 100%; margin-left:10px; margin-right:10px;">'+
                            '<tr><td colspan="2">Currently selected theme set:</td><tr>' +
                            '<tr><td style="width: 18%;">Name:</td><td style="text-align: center;"><input dojoType="dijit.form.TextBox" id="theme_select_themeset_theme_select_textbox" readonly= "true" style="width: 175px;" ></input><input type="button" dojoType="dijit.form.Button" id="theme_select_rename_button" label="Rename" style="margin-left: 5px;"></td></tr>'+
                        '</table>' +
                        '<div style="border-top: 1px solid; top: 231px; border-top-color: #ccc; left: 429px; width: 300px; height: 11px; margin-top: 6px; margin-left:10px;"></div>'+
                        '<table style="margin-left: 15px; width: 100%;">'+
                            '<tr><td>Dojo desktop 1.7 theme:</td><td><select dojoType="dijit.form.Select" id="theme_select_desktop_theme_select"type="text"  style="width: 175px;"  ></select></td></tr>'+
                            '<tr><td>Dojo mobile 1.7 theme:</td><td><select dojoType="dijit.form.Select" id="theme_select_mobile_theme_select"type="text"  style="width: 175px;" ></select></td></tr>'+
                        '</table>' +
                        '<table id="theme_select_devices_table" style="margin-left:30px; border-collapse: separate; border-spacing: 0 0; width: 100%">' +
                        '<tr><td style="width: 129px;">Android:</td><td><select dojoType="dijit.form.Select" id="theme_select_android_select" type="text"  style="width: 150px;"></select></td></tr>' +
                        '<tr><td>Blackberry:</td><td><select dojoType="dijit.form.Select" id="theme_select_blackberry_select" type="text"  style="width: 150px;"></select></td></tr>' +
                        '<tr><td>iPad:</td><td><select dojoType="dijit.form.Select" id="theme_select_ipad_select" type="text"  style="width: 150px;"></select></td></tr>' +
                        '<tr><td>iPhone:</td><td><select dojoType="dijit.form.Select" id="theme_select_iphone_select" type="text"  style="width: 150px;"></select></td></tr>' +
                        '<tr><td>Other:</td><td><select dojoType="dijit.form.Select" id="theme_select_other_select" type="text"  style="width: 150px;"></select></td></tr>' +
                        '</table>' +
                        '<table style="width:100%; margin-top: 10px;">'+
                            '<tr><td style="text-align:right; width:80%;"><input type="button" dojoType="dijit.form.Button" id="theme_select_ok_button" label="Ok"></input></td><td><input type="button" dojoType="dijit.form.Button" id="theme_select_cancel_button" label="Cancel"></input></td></tr>'+
                         '</table>' +
                     '</td>'+
                 '</tr>' +
             '</table>' +
             '';

           return template; 
    }

});