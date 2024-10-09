
// manifest
fetch("/manifest.json").then(d => d.json()).then(data => {
  document.getElementById("app-vers").innerHTML = "v"+data.version;
  document.getElementById("teer-link").href = data.trakteer
})

document.addEventListener(document.getElementById('createdDownload'), cek_url());
const target_div = document.getElementById("dl-section");
const iwara_exp = /http(s)?:\/\/(www\.)?iwara\.tv\/video\/([a-zA-Z0-9_.-]*)/
const base_api = "https://api.iwara.tv"

const opt_fetch = {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "x-version": "a535f0c9b026632c1bffe01d410f786048a86254"
  },
  "referrer": "https://www.iwara.tv/",
  "referrerPolicy": "strict-origin",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "omit"
}
function getCurrentTabUrl(callback) {
  var queryTabs = {
      active: true,
      currentWindow: true
    };
  return chrome.tabs.query(queryTabs, (a)=> callback(a[0].url,a[0]));
}


function cek_url(callback){
  getCurrentTabUrl(async (tab_url,tab)=>{
    var exp = iwara_exp.exec(tab_url);
    if(!exp) return;
    var vid_id = exp[3];
    target_div.innerHTML = `
    <br>
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div><br>
    IWARA page detected!
    `
    var vid_info = await getInfo(vid_id);
    vid_info = await vid_info.json();

    renderInfo(vid_info);

    var links = await getVidUrl(vid_info.fileUrl);
    renderLinks(links, vid_info.title);
  })
}

function build_img(name){
  if(!name) return null;
  return `https://i.iwara.tv/image/original/${name.split(".")[0]}/thumbnail-01.jpg`
}

async function getInfo(vid_id){
  var vid_api_url = base_api+"/video/"+vid_id;
    console.log(vid_api_url);
    return await fetch(vid_api_url)
}

async function getVidUrl(file_url){
  var uri = new URL(file_url);
  var {pathname,search} = uri;
  var path = pathname.split("/");
  var expire = uri.searchParams.get("expires");
  var post_prefix = "_5nFp9kmbNnHdAFhaqMvt"
  var str = path[path.length -1]+"_"+expire+post_prefix;
  console.log(str);
  var f = sha1.sha1(str);
  var res = await fetch(file_url,{headers:{"x-version":f}});
  res = await res.json();
  return res;

}

function renderLinks(links,name){
  
  links.map(e => {
    var template = `
      <a target="_BLANK" href="${e.src.download.replace("//","https://")+"&download=[Iwara-dl] - "+encodeURI(name)+"_"+e.name+".mp4"}">
        <button type="button" class="btn btn-secondary btn-sm">${e.name}</button>
      </a>
    `;
    target_div.innerHTML += template;
  })
  
}

function renderInfo(vid_info){
  var {title, file, fileUrl } = vid_info;
  var thum = build_img(file.name);
  var template = `
    <img src=${thum} style="width:100%"></img>
    <h6>${title}</h6>
  `
  target_div.innerHTML = template;
}


window.sha1 = (function() {

  /*
  * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
  * in FIPS 180-1
  * Version 2.2 Copyright Paul Johnston 2000 - 2009.
  * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
  * Distributed under the BSD License
  * See http://pajhome.org.uk/crypt/md5 for details.
  */

  // Convert a raw string to a hex string
  function rawToHex(raw) {
    var hex = "";
    var hexChars = "0123456789abcdef";
    for (var i = 0; i < raw.length; i++) {
      var c = raw.charCodeAt(i);
      hex += (
        hexChars.charAt((c >>> 4) & 0x0f) +
        hexChars.charAt(c & 0x0f));
    }
    return hex;
  }

  // Calculate the SHA1 of a raw string
  function sha1Raw(raw) {
    return binaryToRaw(sha1Binary(rawToBinary(raw), raw.length * 8));
  }

  /*
  * Convert an array of big-endian words to a string
  */
  function binaryToRaw(bin) {
    var raw = "";
    for (var i = 0, il = bin.length * 32; i < il; i += 8) {
      raw += String.fromCharCode((bin[i >> 5] >>> (24 - i % 32)) & 0xff);
    }
    return raw;
  }

  /*
  * Calculate the SHA-1 of an array of big-endian words, and a bit length
  */
  function sha1Binary(bin, len) {
    // append padding
    bin[len >> 5] |= 0x80 << (24 - len % 32);
    bin[((len + 64 >> 9) << 4) + 15] = len;

    var w = new Array(80);
    var a =  1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d =  271733878;
    var e = -1009589776;

    for (var i = 0, il = bin.length; i < il; i += 16) {
      var _a = a;
      var _b = b;
      var _c = c;
      var _d = d;
      var _e = e;

      for (var j = 0; j < 80; j++) {
        if (j < 16) {
          w[j] = bin[i + j];
        } else {
          w[j] = _rotateLeft(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
        }
        var t = _add(_add(_rotateLeft(a, 5), _ft(j, b, c, d)),
                    _add(_add(e, w[j]), _kt(j)));
        e = d;
        d = c;
        c = _rotateLeft(b, 30);
        b = a;
        a = t;
      }

      a = _add(a, _a);
      b = _add(b, _b);
      c = _add(c, _c);
      d = _add(d, _d);
      e = _add(e, _e);
    }
    return [a, b, c, d, e];
  }

  // Add integers, wrapping at 2^32. This uses 16-bit operations internally
  // to work around bugs in some JS interpreters.
  function _add(x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }

  /*
  * Bitwise rotate a 32-bit number to the left.
  */
  function _rotateLeft(n, count) {
    return (n << count) | (n >>> (32 - count));
  }

  /*
  * Perform the appropriate triplet combination function for the current
  * iteration
  */
  function _ft(t, b, c, d) {
    if (t < 20) {
      return (b & c) | ((~b) & d);
    } else if (t < 40) {
      return b ^ c ^ d;
    } else if (t < 60) {
      return (b & c) | (b & d) | (c & d);
    } else {
      return b ^ c ^ d;
    }
  }

  /*
  * Determine the appropriate additive constant for the current iteration
  */
  function _kt(t) {
    if (t < 20) {
      return 1518500249;
    } else if (t < 40) {
      return 1859775393;
    } else if (t < 60) {
      return -1894007588;
    } else {
      return -899497514;
    }
  }

  // Convert a raw string to an array of big-endian words.
  // Characters >255 have their high-byte silently ignored.
  function rawToBinary(raw) {
    var binary = new Array(raw.length >> 2);
    for (var i = 0, il = binary.length; i < il; i++) {
      binary[i] = 0;
    }
    for (i = 0, il = raw.length * 8; i < il; i += 8) {
      binary[i>>5] |= (raw.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
    }
    return binary;
  }

  // Encode a string as UTF-8.
  // For efficiency, this assumes the input is valid UTF-16.
  function stringToRaw(string) {
    var raw = "", x, y;
    var i = -1;
    var il = string.length;
    while (++i < il) {
      // decode UTF-16 surrogate pairs
      x = string.charCodeAt(i);
      y = i + 1 < il ? string.charCodeAt(i + 1) : 0;
      if (0xd800 <= x && x <= 0xdbff && 0xdc00 <= y && y <= 0xdfff) {
        x = 0x10000 + ((x & 0x03ff) << 10) + (y & 0x03ff);
        ++i;
      }
      // encode output as UTF-8
      if (x <= 0x7f) {
        raw += String.fromCharCode(x);
      } else if (x <= 0x7ff) {
        raw += String.fromCharCode(0xc0 | ((x >>> 6 ) & 0x1f),
                                      0x80 | ( x         & 0x3f));
      } else if (x <= 0xffff) {
        raw += String.fromCharCode(0xe0 | ((x >>> 12) & 0x0f),
                                      0x80 | ((x >>> 6 ) & 0x3f),
                                      0x80 | ( x         & 0x3f));
      } else if (x <= 0x1fffff) {
        raw += String.fromCharCode(0xf0 | ((x >>> 18) & 0x07),
                                      0x80 | ((x >>> 12) & 0x3f),
                                      0x80 | ((x >>> 6 ) & 0x3f),
                                      0x80 | ( x         & 0x3f));
      }
    }
    return raw;
  }

  // Calculate the HMAC-SHA1 of a key and some data (raw strings)
  function hmacRaw(key, data) {
    var binaryKey = rawToBinary(key);
    if (binaryKey.length > 16) {
      binaryKey = sha1Binary(binaryKey, key.length * 8);
    }
    var ipad = new Array(16);
    var opad = new Array(16);
    for(var i = 0; i < 16; i++) {
      ipad[i] = binaryKey[i] ^ 0x36363636;
      opad[i] = binaryKey[i] ^ 0x5c5c5c5c;
    }
    var hash = sha1Binary(ipad.concat(rawToBinary(data)), 512 + data.length * 8);
    return binaryToRaw(sha1Binary(opad.concat(hash), 512 + 160));
  }

  var tests = {
    hmac: {
      "fbdb1d1b18aa6c08324b7d64b71fb76370690e1d":
        ["", ""],
      "de7c9b85b8b78aa6bc8a7a36f70a90701c9db4d9":
        ["key", "The quick brown fox jumps over the lazy dog"]
    },
    sha1: {
      "da39a3ee5e6b4b0d3255bfef95601890afd80709":
        "",
      "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12":
        "The quick brown fox jumps over the lazy dog",
    }
  };

  return {
    sha1: function(s) {
      return rawToHex(sha1Raw(stringToRaw(s)));
    },

    sha1Hex: function(value) {
      return rawToHex(sha1Raw(this.hexToString(value)));
    },

    hmac: function(k, d) {
      return rawToHex(hmacRaw(stringToRaw(k), stringToRaw(d)));
    },

    hexToString: function(hex) {
      var str = '';
      for (var i = 0, il = hex.length; i < il; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      return str;
    },

    test: function() {
      var success = true;
      for (var expectedOutput in tests.sha1) {
        if (tests.sha1.hasOwnProperty(expectedOutput)) {
          var input = tests.sha1[expectedOutput];
          var output = this.sha1(input).toLowerCase();
          if (output !== expectedOutput) {
            console.error(
              "sha1(" + input + ") was " + output +
              " (expected: " + expectedOutput + ")");
            success = false;
          }
        }
      }
      for (var expectedOutput in tests.hmac) {
        if (tests.hmac.hasOwnProperty(expectedOutput)) {
          var input = tests.hmac[expectedOutput];
          var output = this.hmac(input[0], input[1]).toLowerCase();
          if (output !== expectedOutput) {
            console.error(
              "hmac(" + input[0] + ", " + input[1] + ") was " + output +
              " (expected: " + expectedOutput + ")");
            success = false;
          }
        }
      }
      return success;
    }
  };

})();