define([
  'dojo/_base/declare',
  
  'dijit/_WidgetsInTemplateMixin',
  'jimu/BaseWidget',
  
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  
  'dojo/store/Memory',
  'dojo/_base/lang',
  'dojo/on'
],
  function (
    declare,
   
    _WidgetsInTemplateMixin,
    BaseWidget,

    Query,
    QueryTask,
    
    Memory,
    lang,
    on

  ) {

    return declare([BaseWidget, _WidgetsInTemplateMixin], {


      baseClass: 'jimu-widget-cadastralmap',
      villageUrl: null,
      mustilUrl: null,
      khasraUrl: null,


      postCreate: function () {
        this.inherited(arguments);
        this.villageUrl = 'https://xyz/arcgisserver/rest/services/MASTER_PLAN_NWS/MapServer/5';
        this.mustilUrl = 'https://xyz/arcgisserver/rest/services/MASTER_PLAN_NWS/MapServer/7';
        this.khasraUrl = 'https://xyz/arcgisserver/rest/services/MASTER_PLAN_NWS/MapServer/11';
      },

      startup: function () {
        this.inherited(arguments);

        on(this.villName, 'change', lang.hitch(this, this.getMustil));

        on(this.musName, 'change', lang.hitch(this, this.getKhasra));

        on(this.khasraName, 'change', lang.hitch(this, this.getKhasraGeom));

      },

      onOpen: function () {

        this.getVillage();


      },
      // Get Village Details
      getVillage: function () {

        this.shelter.show();
        var query = new Query();
        query.returGeometry = false;
        query.where = '1=1';
        query.outFields = ['*'];

        var queryTask = new QueryTask(this.villageUrl);
        queryTask.execute(query, lang.hitch(this, this.populateVillage));

      },
      // Populate Village Combo
      populateVillage: function (featureSet) {
        var data = {
          identifier: 'id',
          items: [],
          label: 'name'
        };

        for (var i = 0; i < featureSet.features.length; i++) {
          data.items.push(lang.mixin({
            "name": featureSet.features[i].attributes['village_na']
          }, {
              "id": featureSet.features[i].attributes['village_na']
            }));
        }

        //create store
        var villageStore = new Memory({
          data: data
        });

        dijit.byId('villName').attr('store', villageStore);
        this.shelter.hide();
      },

      // Get Mustil Details
      getMustil: function () {
        this.shelter.show();
        // call function: get geometry of the village to zoom to - start
        this.getVillageGeom();
        // call function: get geometry of the village to zoom to - end


        var query = new Query();
        query.returGeometry = false;
        query.where = "village_na = '" + this.villName.displayedValue + "'";
        query.outFields = ['*'];

        var queryTask = new QueryTask(this.mustilUrl);
        queryTask.execute(query, lang.hitch(this, this.populateMustil));


      },
      // populate Mustil Combo
      populateMustil: function (featureSet) {
        var data = {
          identifier: 'id',
          items: [],
          label: 'name'
        };

        for (var i = 0; i < featureSet.features.length; i++) {
          data.items.push(lang.mixin({
            "name": featureSet.features[i].attributes['mustil_no']
          }, {
              "id": featureSet.features[i].attributes['mustil_no']
            }));
        }

        //create store
        var mustilStore = new Memory({
          data: data
        });

        dijit.byId('musName').attr('store', mustilStore);
        this.shelter.hide();
      },


      // get the geometry of the village--- start
      getVillageGeom: function () {
        this.shelter.show();

        var query = new Query();
        query.returnGeometry = true;
        query.where = "village_na = '" + this.villName.displayedValue + "'";
        query.outFields = ['*'];
        query.outSpatialReference = this.map.spatialReference;

        var queryTask = new QueryTask(this.villageUrl);
        queryTask.execute(query, lang.hitch(this, this.zoomToVillage));

      },
      zoomToVillage: function (featureSet) {

        this.map.setExtent(featureSet.features[0].geometry.getExtent());

        this.shelter.hide();
      },

      // get the geometry of the village--- end



      // Get Killa Details
      getKhasra: function () {
        this.shelter.show();
        // call function: get geometry of the mustil to zoom to - start
        this.getMustilGeom();
        // call function: get geometry of the mustil to zoom to - end

        var query = new Query();
        query.returGeometry = false;
        query.where = "village_na = '" + this.villName.displayedValue + "' AND mustil_no = '" + this.musName.displayedValue + "'";
        query.returnDistinctValues = true;
        query.outFields = ['*'];

        var queryTask = new QueryTask(this.khasraUrl);
        queryTask.execute(query, lang.hitch(this, this.populateKhasra));

      },

      // populate Khasra Combo
      populateKhasra: function (featureSet) {
        var data = {
          identifier: 'id',
          items: [],
          label: 'name'
        };

        for (var i = 0; i < featureSet.features.length; i++) {
          data.items.push(lang.mixin({
            "name": featureSet.features[i].attributes['khasra_no']
          }, {
              "id": featureSet.features[i].attributes['khasra_no']
            }));
        }

        //create store
        var khasraStore = new Memory({
          data: data
        });

        dijit.byId('khasraName').attr('store', khasraStore);

        this.shelter.hide();
      },

      // get the geometry of the mustil--- start
      getMustilGeom: function () {

        this.shelter.show();
        var query = new Query();
        query.returnGeometry = true;
        query.where = "village_na = '" + this.villName.displayedValue + "' AND mustil_no = '" + this.musName.displayedValue + "'";
        query.outFields = ['*'];
        query.outSpatialReference = this.map.spatialReference;

        var queryTask = new QueryTask(this.mustilUrl);
        queryTask.execute(query, lang.hitch(this, this.zoomToMustil));

      },
      zoomToMustil: function (featureSet) {

        this.map.setExtent(featureSet.features[0].geometry.getExtent());
        this.shelter.hide();
      },

      // get the geometry of the mustil--- end

      // get the geometry of the khasra--- start
      getKhasraGeom: function () {
        this.shelter.show();
        var query = new Query();
        query.returnGeometry = true;
        query.where = "village_na = '" + this.villName.displayedValue + "' AND mustil_no = '" + this.musName.displayedValue + "' AND khasra_no = '" + this.khasraName.displayedValue + "'";
        query.outFields = ['*'];
        query.outSpatialReference = this.map.spatialReference;

        var queryTask = new QueryTask(this.khasraUrl);
        queryTask.execute(query, lang.hitch(this, this.zoomToKhasra));

      },
      zoomToKhasra: function (featureSet) {

        this.map.setExtent(featureSet.features[0].geometry.getExtent());
        this.shelter.hide();
      },

      // get the geometry of the khasra--- end


      onClose: function () {

      }


    });
  });