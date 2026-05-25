-----------------
# PCP
-----------------

# cmdline.txt

```
dwc_otg.fiq_fsm_mask=0xF host=pCP dwc_otg.lpm_enable=0 console=tty1 root=/dev/ram0 rootwait quiet nortc loglevel=3 noembed smsc95xx.turbo_mode=N noswap consoleblank=0 waitusb=2 ip=192.168.0.200:192.168.0.1:192.168.0.1:255.255.255.0 fsck.repair=yes waitusb=10

```
