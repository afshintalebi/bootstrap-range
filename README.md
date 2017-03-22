# bootstrap-range
jQuery plugin for select minimum and maximum value from a list

```javascript
$('.price').bootstrapRange({
    minValues: [0,1000,2000,3000],
    maxValues: [0,1000,2000,3000],
    minPlaceholder:'Minimum',
    maxPlaceholder:'Maximum',
    minHintText: "from",
    maxHintText: "to",
    minimumCallback: function (min) {
        console.log(min);
    },
    maximumCallback: function (max) {
        console.log(max);
    }
});
```
