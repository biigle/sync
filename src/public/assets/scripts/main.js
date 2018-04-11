biigle.$viewModel("export-container",function(e){var t=biigle.$require("messages.store"),n={volumes:biigle.$require("api.volumes"),labelTrees:biigle.$require("api.labelTree"),users:biigle.$require("api.users")},i=biigle.$require("sync.exportApiUrl"),s=biigle.$require("sync.allowedExports");new Vue({el:e,mixins:[biigle.$require("core.mixins.loader")],components:{tabs:VueStrap.tabs,tab:VueStrap.tab,entityChooser:biigle.$require("sync.components.entityChooser")},data:{entities:{volumes:[],labelTrees:[],users:[]},chosenEntities:{volumes:[],labelTrees:[],users:[]},currentTab:0},computed:{indexMap:function(){return["volumes","labelTrees","users"].filter(function(e){return-1!==s.indexOf(e)})},volumes:function(){return this.entities.volumes},labelTrees:function(){return this.entities.labelTrees},users:function(){return this.entities.users.map(function(e){return e.name=e.firstname+" "+e.lastname,e.email&&(e.description=e.email),e})},hasNoChosenVolumes:function(){return 0===this.chosenEntities.volumes.length},hasNoChosenLabelTrees:function(){return 0===this.chosenEntities.labelTrees.length},hasNoChosenUsers:function(){return 0===this.chosenEntities.users.length},volumeRequestUrl:function(){return i+"/volumes"+this.getQueryString("volumes")},labelTreeRequestUrl:function(){return i+"/label-trees"+this.getQueryString("labelTrees")},userRequestUrl:function(){return i+"/users"+this.getQueryString("users")}},methods:{handleSwitchedTab:function(e){this.currentTab=e},fetchEntities:function(e){0===this.entities[e].length&&(this.startLoading(),n[e].get().bind(this).then(function(t){this.entities[e]=t.data},t.handleErrorResponse).finally(this.finishLoading))},handleChosenVolumes:function(e){this.chosenEntities.volumes=e},handleChosenLabelTrees:function(e){this.chosenEntities.labelTrees=e},handleChosenUsers:function(e){this.chosenEntities.users=e},getQueryString:function(e){var t=this.entities[e],n=this.chosenEntities[e];return t.length/2>n.length?"?only="+(n.map(function(e){return e.id}).join(",")||-1):t.length>n.length?"?except="+t.filter(function(e){return-1===n.indexOf(e)}).map(function(e){return e.id}).join(","):""}},watch:{currentTab:function(e){this.fetchEntities(this.indexMap[e])}},created:function(){this.fetchEntities(this.indexMap[0])}})}),biigle.$viewModel("label-tree-import-container",function(e){var t=biigle.$require("messages.store"),n=biigle.$require("sync.api.import"),i=biigle.$require("sync.importToken"),s=biigle.$require("sync.adminRoleId");new Vue({el:e,mixins:[biigle.$require("sync.mixins.importContainer")],data:{labelTreeCandidates:biigle.$require("sync.labelTreeCandidates"),labelCandidates:biigle.$require("sync.labelCandidates"),conflictingParents:biigle.$require("sync.conflictingParents"),userCandidates:biigle.$require("sync.userCandidates"),chosenLabelTrees:[],chosenLabels:[]},computed:{userMap:function(){var e={};return this.userCandidates.forEach(function(t){t.name=t.firstname+" "+t.lastname,e[t.id]=t}),e},chosenUsers:function(){var e=this,t=[];return this.chosenLabelTrees.forEach(function(e){e.members.forEach(function(e){e.role_id===s&&-1===t.indexOf(e.id)&&t.push(e.id)})}),t.filter(function(t){return e.userMap.hasOwnProperty(t)}).map(function(t){return e.userMap[t]})},hasChosenUsers:function(){return this.chosenUsers.length>0},labels:function(){return this.labelCandidates.map(function(e){return e.description="Label tree: "+e.label_tree_name,e})},labelMap:function(){var e={};return this.labels.forEach(function(t){e[t.id]=t}),e},conflictingParentMap:function(){var e={};return this.conflictingParents.forEach(function(t){e[t.id]=t}),e},conflictingLabels:function(){return this.chosenLabels.filter(function(e){return e.hasOwnProperty("conflicting_name")||e.hasOwnProperty("conflicting_parent_id")}).map(function(e){return e.hasOwnProperty("conflicting_parent_id")&&(e.parent=this.labelMap[e.parent_id],e.conflicting_parent=this.conflictingParentMap[e.conflicting_parent_id]),e},this)},hasConflictingLabels:function(){return this.conflictingLabels.length>0},hasNoChosenItems:function(){return 0===this.chosenLabelTrees.length&&0===this.chosenLabels.length},hasUnresolvedConflicts:function(){var e=this;return!this.conflictingLabels.reduce(function(t,n){return t&&e.isLabelConflictResolved(n)},!0)},submitTitle:function(){return this.hasNoChosenItems?"Choose label trees or labels to import":this.hasUnresolvedConflicts?"Resolve the label conflicts":"Perform the import"},panelClass:function(){return{"panel-danger":this.hasUnresolvedConflicts}},panelBodyClass:function(){return{"text-danger":this.hasUnresolvedConflicts}},chosenLabelTreeIds:function(){return this.chosenLabelTrees.map(function(e){return e.id})},chosenLabelIds:function(){return this.chosenLabels.map(function(e){return e.id})},nameConflictResolutions:function(){var e={};return this.conflictingLabels.forEach(function(t){this.hasLabelConflictingName(t)&&(e[t.id]=t.conflicting_name_resolution)},this),e},parentConflictResolutions:function(){var e={};return this.conflictingLabels.forEach(function(t){this.hasLabelConflictingParent(t)&&(e[t.id]=t.conflicting_parent_resolution)},this),e}},methods:{handleChosenLabelTrees:function(e){this.chosenLabelTrees=e},handleChosenLabels:function(e){this.chosenLabels=e},hasLabelConflictingName:function(e){return e.hasOwnProperty("conflicting_name")},hasLabelConflictingParent:function(e){return e.hasOwnProperty("conflicting_parent_id")},isLabelConflictResolved:function(e){return(!this.hasLabelConflictingName(e)||e.conflicting_name_resolution)&&(!this.hasLabelConflictingParent(e)||e.conflicting_parent_resolution)},chooseAllImportInformation:function(){this.conflictingLabels.forEach(function(e){this.chooseImportParent(e),this.chooseImportName(e)},this)},chooseAllExistingInformation:function(){this.conflictingLabels.forEach(function(e){this.chooseExistingParent(e),this.chooseExistingName(e)},this)},chooseImportParent:function(e){this.hasLabelConflictingParent(e)&&Vue.set(e,"conflicting_parent_resolution","import")},chooseImportName:function(e){this.hasLabelConflictingName(e)&&Vue.set(e,"conflicting_name_resolution","import")},chooseExistingParent:function(e){this.hasLabelConflictingParent(e)&&Vue.set(e,"conflicting_parent_resolution","existing")},chooseExistingName:function(e){this.hasLabelConflictingName(e)&&Vue.set(e,"conflicting_name_resolution","existing")},performImport:function(){this.startLoading();var e={};this.chosenLabelTreeIds.length<this.labelTreeCandidates.length&&(e.only_label_trees=this.chosenLabelTreeIds),this.chosenLabelIds.length<this.labelCandidates.length&&(e.only_labels=this.chosenLabelIds),this.hasConflictingLabels&&(e.name_conflicts=this.nameConflictResolutions,e.parent_conflicts=this.parentConflictResolutions),n.update({token:i},e).then(this.importSuccess,t.handleErrorResponse).finally(this.finishLoading)}}})}),biigle.$viewModel("user-import-container",function(e){var t=biigle.$require("messages.store"),n=biigle.$require("sync.api.import"),i=biigle.$require("sync.importToken");new Vue({el:e,mixins:[biigle.$require("sync.mixins.importContainer")],data:{importCandidates:biigle.$require("sync.importCandidates"),chosenCandidates:[]},computed:{users:function(){return this.importCandidates.map(function(e){return e.name=e.firstname+" "+e.lastname,e.email&&(e.description=e.email),e})},hasNoChosenUsers:function(){return 0===this.chosenCandidates.length},chosenCandidateIds:function(){return this.chosenCandidates.map(function(e){return e.id})}},methods:{handleChosenUsers:function(e){this.chosenCandidates=e},performImport:function(){this.startLoading();var e={};this.chosenCandidates.length<this.importCandidates.length&&(e.only=this.chosenCandidateIds),n.update({token:i},e).then(this.importSuccess,t.handleErrorResponse).finally(this.finishLoading)}}})}),biigle.$declare("sync.api.import",Vue.resource("api/v1/import{/token}")),biigle.$component("sync.components.entityChooser",{template:'<div class="entity-chooser"><entity-chooser-list class="entity-chooser-list--left" :entities="unchosenFilteredEntities" :filtering="true" @select="handleSelect" @filter="handleFiltering" ></entity-chooser-list><div class="entity-chooser-buttons"><button class="btn btn-default btn-block" @click="chooseAll" :disabled="hasNoUnchosenEntities" title="Select all">all</button><button class="btn btn-default btn-block" @click="chooseNone" :disabled="hasNoChosenEntities" title="Select none">none</button></div><entity-chooser-list class="entity-chooser-list--right" :entities="chosenEntities" @select="handleDeselect"></entity-chooser-list></div>',components:{entityChooserList:biigle.$require("sync.components.entityChooserList")},props:{entities:{type:Array,required:!0}},data:function(){return{chosenIds:{},filterQuery:""}},computed:{unchosenEntities:function(){return this.entities.filter(function(e){return!this.chosenIds[e.id]},this)},unchosenFilteredEntities:function(){var e=this.filterQuery.trim();if(e){var t=e.toLowerCase().split(" ");return this.unchosenEntities.filter(function(e){var n=e.name.toLowerCase();return e.description&&(n+=" "+e.description.toLowerCase()),t.reduce(function(e,t){return e&&-1!==n.indexOf(t)},!0)})}return this.unchosenEntities},chosenEntities:function(){return this.entities.filter(function(e){return this.chosenIds[e.id]},this)},hasNoUnchosenEntities:function(){return 0===this.unchosenEntities.length},hasNoChosenEntities:function(){return 0===this.chosenEntities.length}},methods:{handleSelect:function(e){Vue.set(this.chosenIds,e.id,!0)},handleDeselect:function(e){this.chosenIds[e.id]=!1},chooseAll:function(){this.unchosenFilteredEntities.forEach(this.handleSelect)},chooseNone:function(){this.chosenEntities.forEach(this.handleDeselect)},handleFiltering:function(e){this.filterQuery=e}},watch:{chosenEntities:function(e){this.$emit("select",e)}}}),biigle.$component("sync.components.entityChooserList",{template:'<div class="entity-chooser-list"><input type="text" class="form-control entity-chooser-list-search" placeholder="Filter..." v-model="filterQuery" v-if="filtering"><ul><li v-for="e in entities" @click="select(e)"><span v-text="e.name"></span><span v-if="true"><br><span class="text-muted" v-text="e.description"></span></span></li></ul></div>',props:{entities:{type:Array,required:!0},filtering:{type:Boolean,default:!1}},data:function(){return{filterQuery:""}},methods:{select:function(e){this.$emit("select",e)}},watch:{filterQuery:function(e){this.$emit("filter",e)}}}),biigle.$component("sync.mixins.importContainer",{mixins:[biigle.$require("core.mixins.loader")],components:{entityChooser:biigle.$require("sync.components.entityChooser")},data:function(){return{success:!1}},methods:{importSuccess:function(){this.success=!0}}});