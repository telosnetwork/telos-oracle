# telos-oracle


## To run delphioracle
First configure, copy `delphioracle/delphiConfig.json.example` to `delphioracle/delphiConfig.json` and provide a key and change the permission name to the one you want to use.  Also change the endpoint if you wish.

Next, install the node dependencies:
```npm install```

Then to run (put this in cron for every minute):
```node delphioracle/delphiUpdate.js```

To use a different permission besides active, for a BP named `blockproduce` this will create a linked permission named `oracle`:
```
cleos set account permission blockproduce oracle <PUBLIC KEY TO SIGN WITH> active
cleos set action permission blockproduce delphioracle write oracle
```
