import Component from '@ember/component';
import { get, set, computed } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';

import layout from 'ember-tags-input/templates/components/ember-tags-input';

const KEY_CODES = {
  BACKSPACE: 8
};

/**
 Component converts a user's typing into tags. New tags are created when the user types a comma, space, semi colon
 or hits the enter key. Tags can be removed using the backspace key or by clicking the x button on each tag.
 Tags can be edited by click on existing tag.

 **Usage:**
 ```handlebars
 \{{#ember-tags-input
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

 @class EmberTagsInput
 @public
 */
export default Component.extend({
  layout,

  classNames: ['eti'],

  classNameBindings: ['readOnly:eti-read-only'],

  /**
   An array of tags to render.

   @property tagsData
   @type Array[String]
   @public
   */
  tagsData: null,

  /**
   @property tags
   @type Array[Object]
   @private
   */
  tags: computed('tagsData.[]', {
    get() {
      return (this.get('tagsData') || []).map((tagLabel) => {
        return {
          label: tagLabel,
          editable: this.isTagEditable(tagLabel),
          classNames: this.getTagCssClassNames(tagLabel)
        }
      });
    }
  }),

  /**
   If a read only view of the tags should be displayed. If enabled, existing tags can't be edited or removed
   and new tags can't be added.

   @property readOnly
   @type Boolean
   @public
   */
  readOnly: false,

  /**
   Enables tags edit mode.

   @property isEditTagsModeEnabled
   @type Boolean
   @public
   */
  isEditTagsModeEnabled: true,

  /**
   String of svg id for tag remove button.

   @property tagRemoveButtonSvgId
   @type String
   @public
   */
  tagRemoveButtonSvgId: 'eti-cancel',

  /**
   @property newTagInputValue
   @type String
   @private
   */
  newTagInputValue: null,

  /**
   The edit tag placeholder text to display when the user hasn't typed anything.

   @property editTagInputPlaceholder
   @type String
   @public
   */
  editTagInputPlaceholder: 'Enter a tag...',

  /**
   The new tag placeholder text to display when the user hasn't typed anything.

   @property newTagInputPlaceholder
   @type String
   @public
   */
  newTagInputPlaceholder: 'Add a tag...',

  /**
   @property editTagInputMaxLength
   @type Number
   @public
   */
  editTagInputMaxLength: null,

  /**
   @property newTagInputMaxLength
   @type Number
   @public
   */
  newTagInputMaxLength: null,

  /**
   Enables auto width for new tag input.

   @property isAutoNewInputWidthEnabled
   @type Boolean
   @public
   */
  isAutoNewInputWidthEnabled: true,

  /**
   Enables auto width for edit tag input.

   @property isAutoEditInputWidthEnabled
   @type Boolean
   @public
   */
  isAutoEditInputWidthEnabled: true,

  /**
   If 'x' removal links should be displayed at the right side of each tag.

   @property showRemoveButtons
   @type Boolean
   @public
   */
  showRemoveButtons: true,

  onTagClick(tag) {
    if (!this.get('readOnly')) {
      this.get('tags').forEach((tag) => this.disableEditMode(tag));

      this.enableEditMode(tag);

      if (this.get('isAutoEditInputWidthEnabled')) {
        scheduleOnce('afterRender', () => this.updateEditInputWidth());
      }

      this.focusEditInput();
    }
  },

  enableEditMode(tag) {
    set(tag, 'editMode', true);
  },

  disableEditMode(tag) {
    set(tag, 'editMode', false);
  },

  isTagEditable() {
    return true;
  },

  getTagCssClassNames() {
    return '';
  },

  onNewTagInputKeyDown({ which, target: { value } }) {
    if (which === KEY_CODES.BACKSPACE) {
      value = value && value.trim();

      if (!value && this.get('tags.length')) {
        scheduleOnce('afterRender', () => this.onRemoveTagAtIndex(this.get('tags.length') - 1));
      }
    }
  },

  onNewTagInputInput({ target: { value }}) {
    if (this.hasSplitSymbols(value)) {
      this.onNewTagInputFocusOut(value);
    }

    if (this.get('isAutoNewInputWidthEnabled')) {
      this.updateNewInputWidth();
    }
  },

  onEditTagInputInput({ label }) {
    if (this.hasSplitSymbols(label)) {
      const $input = this.getNewInputElement();
      $input.focus();
    }

    if (this.get('isAutoEditInputWidthEnabled')) {
      this.updateEditInputWidth();
    }
  },

  hasSplitSymbols(value = '') {
    const splitSymbols = this.getSplitSymbols();

    return splitSymbols.any(splitSymbol => value.includes(splitSymbol));
  },

  onNewTagInputEnter(value) {
    this.onNewTagInputFocusOut(value);

    if (this.get('isAutoNewInputWidthEnabled')) {
      this.updateNewInputWidth();
    }
  },

  onEditTagInputEnter() {
    const $input = this.getNewInputElement();
    $input.focus();

    if (this.get('isAutoEditInputWidthEnabled')) {
      this.updateEditInputWidth();
    }
  },

  onNewTagInputFocusOut(value) {
    value = value && value.trim();

    if (value) {
      const tagsLabels = this.getTagsFromInputValue(value);

      if (tagsLabels.length === 1) {
        scheduleOnce('afterRender', () => this.onAddTag(tagsLabels[0]));
      } else {
        scheduleOnce('afterRender', () => this.onAddTags(tagsLabels));
      }
    }

    scheduleOnce('afterRender', () => {
      const $input = this.getNewInputElement();
      $input.val('');

      if (this.get('isAutoNewInputWidthEnabled')) {
        this.updateNewInputWidth();
      }
    });
  },

  onEditTagInputFocusOut(tag, index) {
    const value = tag.label.trim();

    if (value.length) {
      const tagsLabels = this.getTagsFromInputValue(value);

      if (tagsLabels.length === 1) {
        scheduleOnce('afterRender', () => this.onUpdateTagAtIndex(tagsLabels[0], index));
      } else {
        scheduleOnce('afterRender', () => this.onReplaceTagAtIndex(tagsLabels, index));
      }

    } else {
      scheduleOnce('afterRender', () => this.onRemoveTagAtIndex(index));
    }

    if (this.get('isAutoEditInputWidthEnabled')) {
      this.updateEditInputWidth();
    }
  },

  getTagsFromInputValue(value) {
    const splitSymbols = this.getSplitSymbols();

    if (splitSymbols && splitSymbols.length) {
      splitSymbols.forEach(splitSymbol => {
        value = value.replace(new RegExp(splitSymbol, 'g'), splitSymbols[0]);
      });

      return value.split(splitSymbols[0]).reduce((tags, tag) => {
        tag = tag.trim();

        return tag ? [...tags, tag] : tags;
      }, []);
    }

    return [value];
  },

  getSplitSymbols() {
    return [' ', ',', ';'];
  },

  /**
   Action which occurs when tag should be added.

   @method onAddTag
   @public
   */
  onAddTag() {},

  /**
   Action which occurs when tags should be added.

   @method onAddTags
   @public
   */
  onAddTags() {},

  /**
   Action which occurs when tag should be updated.

   @method onUpdateTagAtIndex
   @public
   */
  onUpdateTagAtIndex() {},

  /**
   Action which occurs when tag should be replaced with new tags.

   @method onReplaceTagAtIndex
   @public
   */
  onReplaceTagAtIndex() {},

  /**
   Action which occurs when tag should be removed.

   @method onRemoveTagAtIndex
   @public
   */
  onRemoveTagAtIndex() {},

  focusNewInput() {
    scheduleOnce('afterRender', () => {
      const $input = this.getNewInputElement();
      $input.focus();
    });
  },

  focusEditInput() {
    scheduleOnce('afterRender', () => {
      const $input = this.getEditInputElement();
      $input.focus();
    });
  },

  updateNewInputWidth() {
    const $input = this.getNewInputElement();

    this.updateInputWidth($input);
  },

  updateEditInputWidth() {
    const $input = this.getEditInputElement();

    this.updateInputWidth($input);
  },

  updateInputWidth($input) {
    const $inputBuffer = this.getInputBufferElement();

    $inputBuffer.html(this.getFormattedText($input.val()));
    $input.width($inputBuffer.width());
  },
  
  getFormattedText(text){
    return text.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/ /g, '&nbsp;');
  },

  getNewInputElement() {
    return this.$('.eti-new-input');
  },

  getEditInputElement() {
    return this.$('.eti-edit-input');
  },

  getInputBufferElement() {
    return this.$('.eti-input-buffer');
  }
});
