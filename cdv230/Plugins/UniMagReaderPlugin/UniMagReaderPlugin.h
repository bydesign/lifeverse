#import <Cordova/CDV.h>

#import <UIKit/UIKit.h>
#import <MessageUI/MessageUI.h>
#import "uniMag.h"

@interface UniMagReaderPlugin : CDVPlugin

- (void)initiateReader:(CDVInvokedUrlCommand*)command;
- (void)isReadyForScan:(CDVInvokedUrlCommand*)command;
- (void)getScannedData:(CDVInvokedUrlCommand*)command;

@end