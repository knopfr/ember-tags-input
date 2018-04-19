ember-tags-input
==============================================================================

ember-tags-input is a simple Ember addon that converts a user's typing into tags. New tags are created when the user types a comma, space, semi colon or hits the enter key. Tags can be removed using the backspace key or by clicking the x button on each tag. Tags can be edited by click on existing tag.

Installation
------------------------------------------------------------------------------

```
ember install ember-tags-input
```


Usage
------------------------------------------------------------------------------

In the simplest case, just pass a list of tags to render and actions for adding and removing tags. The component will never change the tags list for you, it will instead call actions when changes need to be made. The component will yield each tag in the list, allowing you to render it as you wish.

 ```handlebars
 {{#ember-tags-input
    tagsData=tags
    onAddTag=(action addTag)
    onAddTags=(action addTags)
    onUpdateTagAtIndex=(action updateTagAtIndex)
    onReplaceTagAtIndex=(action replaceTagAtIndex)
    onRemoveTagAtIndex=(action removeTagAtIndex)
    as |tagLabel|
 }}
  {{tagLabel}}
 {{/ember-tags-input}}
 ```

 ```javascript
 import Controller from '@ember/controller';

 export default Controller.extend({
  tags: null,

  init() {
    this._super(...arguments);

    this.set('tags', ['tag-1', 'tag-2', 'tag-3']);
  },

  addTag(newTag) {
    this.get('tags').addObject(newTag);
  },
  
  addTags(newTags) {
    this.get('tags').addObject(newTags);
  },

  updateTagAtIndex(tag, index) {
    this.get('tags').replace(index, 1, tag);
  },

  replaceTagAtIndex(tags, index) {
    this.get('tags').replace(index, 1, tags);
  },

  removeTagAtIndex(index) {
    this.get('tags').removeAt(index);
  }
 });
 ```


Options
------------------------------------------------------------------------------

### tags
- An array of tags to render.
- **default: null**

### readOnly
- If a read only view of the tags should be displayed. If enabled, existing tags can't be edited or removed and new tags can't be added.
- **default: false**

### isEditTagsModeEnabled
- Enables tags edit mode.
- **default: true**

### tagRemoveButtonSvgId
- String of svg id for tag remove button.
- **default: null**

### editTagInputPlaceholder
- The edit tag placeholder text to display when the user hasn't typed anything.
- **default: 'Enter a tag...'**

### newTagInputPlaceholder
- The new tag placeholder text to display when the user hasn't typed anything.
- **default: 'Add a tag...'**

### isAutoNewInputWidthEnabled
- Enables auto width for new tag input.
- **default: true**

### isAutoEditInputWidthEnabled
- Enables auto width for edit tag input.
- **default: true**

### showRemoveButtons
- If 'x' removal links should be displayed at the right side of each tag.
- **default: true**
