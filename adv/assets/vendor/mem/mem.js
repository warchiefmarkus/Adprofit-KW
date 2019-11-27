function Mem()
{
    this.data = {};
    this.exp = {};
    this.pref = '_mem_';
    this.pref_exp = '_mem-exp_';

    var _t = this;

    chrome.storage.local.get(null, function(items) {
        var keys = Object.keys(items);

        for(var i in keys)
        {
            if(new RegExp(_t.pref).test(keys[i]) && items[keys[i]] !== null)
                _t.data[keys[i]] = items[keys[i]];

            if(new RegExp(_t.pref_exp).test(keys[i]) && items[keys[i]] !== null)
                _t.exp[keys[i]] = items[keys[i]];
        }

    });

    chrome.storage.onChanged.addListener(function(changes) {
        var keys = Object.keys(changes);

        for(var i in keys)
        {
            if(new RegExp(_t.pref).test(keys[i]))
                _t.data[keys[i]] = changes[keys[i]].newValue;

            if(new RegExp(_t.pref_exp).test(keys[i]))
                _t.exp[keys[i]] = changes[keys[i]].newValue;
        }
    });

}


Mem.prototype.get = function(key)
{
    var result = [];

    if(key.constructor !== Array)
        key = [String(key)];

    for(var i in key)
    {
        var k = this.pref+key[i];
        if(this.data[k] !== undefined && (!this.exp[this.pref_exp+key[i]] || this.exp[this.pref_exp+key[i]] > (new Date()).valueOf()))
            result.push(this.data[k]);
        else
            result.push(null);
    }

    if(!result.length)
        return null;

    if(result.length === 1)
        return result[0];
    else
        return result;
};

Mem.prototype.set = function(key, value, exp)
{
    var set = {};
    set[this.pref+key] = value;
    set[this.pref_exp+key] = exp ? (new Date()).valueOf()+exp*1000 : null;
    chrome.storage.local.set(set);
    console.log(set);
};

Mem.prototype.remove = function(key)
{
    if(key.constructor !== Array)
        key = [String(key)];

    var keys = [];
    var set = {};
    for(var i in key)
    {
        var del = this.pref+key[i], exp = this.pref_exp+key[i];

        set[del] = null;
        set[exp] = null;

        keys.push(del);
        keys.push(exp);

        delete this.data[del];
        delete this.exp[exp];
    }

    chrome.storage.local.set(set);
    chrome.storage.local.remove(key);
};

Mem.prototype.clear = function()
{
    var _t = this;
    chrome.storage.local.get(null, function(items) {
        var keys = Object.keys(items);

        for(var i in keys)
        {
            var key = keys[i];
            if(new RegExp(_t.pref).test(key) || new RegExp(_t.pref_exp).test(key))
                chrome.storage.local.remove(key);
        }

    });
};