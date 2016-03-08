'use strict';

module.exports = function isLoggedIn() {
  if(!document.cookie)
    return false;

  return true;
}
