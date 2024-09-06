import Filter from './Filter';

export default class InsertScriptFilter extends Filter {

  constructor() {
    super();
  }

  init() {
    this.overrideAppendChild();
    this.overrideInsertBefore();
  }

  overrideAppendChild() {

    Element.prototype.appendChild = function(elem) {
      if(arguments[0].tagName === 'SCRIPT') {
        //console.log('Appending:', arguments);
        for (let key in window.CookieConsent.config.services) {
          // Did user opt-in?
          if(window.CookieConsent.config.services[key].type === 'dynamic-script') {
            if(arguments[0].outerHTML.indexOf(window.CookieConsent.config.services[key].search) >= 0) {
              if(window.CookieConsent.config.categories[window.CookieConsent.config.services[key].category].wanted === false) {
                window.CookieConsent.buffer.appendChild.push({'this': this, 'category': window.CookieConsent.config.services[key].category, arguments: arguments});
                return undefined;
              }
            }
          }
        }
      } 
  
      return Node.prototype.appendChild.apply(this, arguments);
    }

  }

  overrideInsertBefore() {

    Element.prototype.insertBefore = function(elem) {
    
      var ele = null;
      var consented = false;
      var filter = 0;

      if(arguments[0].tagName === 'SCRIPT') {
        //console.log('Inserting:', arguments);
        for (let key in window.CookieConsent.config.services) {
          // Did user opt-in?
          if(window.CookieConsent.config.services[key].type === 'dynamic-script') {
            if(arguments[0].outerHTML.indexOf(window.CookieConsent.config.services[key].search) >= 0) {
              if(window.CookieConsent.config.categories[window.CookieConsent.config.services[key].category].wanted === false && !consented) {
                if (ele === null) {
                  ele = {
                    'this': this,
                    'category': window.CookieConsent.config.services[key].category,
                    'categories': [window.CookieConsent.config.services[key].category],
                    arguments: arguments
                  };
                } else {
                  ele.categories.push(window.CookieConsent.config.services[key].category);
                }
                filter++;
              } else {
                ele = null;
                consented = true;
                filter = 0;
              }
            }
          }
        }
      }
  
      if (filter > 0) {
        window.CookieConsent.buffer.insertBefore.push(ele);
        return;
      }

      return Node.prototype.insertBefore.apply(this, arguments);
    }
  }

}