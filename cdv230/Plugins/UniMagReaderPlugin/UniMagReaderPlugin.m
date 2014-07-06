#import "UniMagReaderPlugin.h"
#import <Cordova/CDV.h>

@implementation UniMagReaderPlugin

uniMag *uniReader;
NSString *scannedData;

- (void)initiateReader:(CDVInvokedUrlCommand*)command
{
    // This starts all needed processes
    NSLog(@"Starting initiateReader functionality");
    
    CDVPluginResult* pluginResult = nil;
    NSString *outStr;
    outStr = @"UniMag Reader Initiated";
    NSLog(outStr);
    
    ///////////////////////////////////////////////
    // Here is where the code from IDTech goes
    //activate SDK
    [self umsdk_activate];
    NSLog(@"Running Task 1:");
    [self logCurrentTask];
    UmRet ret = [uniReader startUniMag:TRUE];
    NSLog(@"Running Task 2:");
    [self logCurrentTask];
    [uniReader requestSwipe];
    NSLog(@"Running Task 3:");
    [self logCurrentTask];
    NSLog(@"Starting initiateReader functionality");
    // Call checkCardReaderStatus repeatedly
    [NSTimer scheduledTimerWithTimeInterval:1.0 target:self selector:@selector(checkCardReaderStatus) userInfo:nil repeats:YES];
    ///////////////////////////////////////////////
    
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:outStr];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    
    NSLog(@"Finishing initiateReader functionality");
}

- (void)isReadyForScan:(CDVInvokedUrlCommand*)command
{
    // This returns true or false depending on whether a card scan will currently work
    NSLog(@"Starting isReadyForScan functionality");
    
    CDVPluginResult* pluginResult = nil;
    BOOL itIsReady = false;
    
    ///////////////////////////////////////////////
    // Here is where the code from IDTech goes
    
    NSLog(@"Running Task 4:");
    [self checkCardReaderStatus];
    
    // Find out if the UniMag is ready for a user to swipe
    if (uniReader.getRunningTask == UMTASK_SWIPE)
    {
        itIsReady = true;
    }
    ///////////////////////////////////////////////
    
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:itIsReady ? 1 : 0];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    
    NSLog(@"Finishing isReadyForScan functionality");
}

- (void)getScannedData:(CDVInvokedUrlCommand*)command
{
    // This returns scanned data, if there is any
    NSLog(@"Starting getScannedData functionality");
    
    CDVPluginResult* pluginResult = nil;
    
    ///////////////////////////////////////////////
    // Here is where the code from IDTech goes
    //
    // scannedData is defined globally and filled
    // when a scan happens, not when this is called.
    ///////////////////////////////////////////////
    
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:scannedData];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    
    NSLog(@"Finishing getScannedData functionality");
}

-(void) logCurrentTask
{
    if (uniReader.getRunningTask == UMTASK_NONE)
    {
        NSLog(@"UMTASK_NONE");
    }
    if (uniReader.getRunningTask == UMTASK_CONNECT)
    {
        NSLog(@"UMTASK_CONNECT");
    }
    if (uniReader.getRunningTask == UMTASK_SWIPE)
    {
        NSLog(@"UMTASK_SWIPE");
    }
    if (uniReader.getRunningTask == UMTASK_CMD)
    {
        NSLog(@"UMTASK_CMD");
    }
    if (uniReader.getRunningTask == UMTASK_FW_UPDATE)
    {
        NSLog(@"UMTASK_FW_UPDATE");
    }
}

-(void) changeJSStatusVariable
{
    NSLog(@"changeJSStatusVariable called");
    if (uniReader.getRunningTask == UMTASK_SWIPE)
    {
        NSString* statusJS = @"UniMagReader.isready = true;";
        [super writeJavascript:statusJS];
    }
    else
    {
        NSString* statusJS = @"UniMagReader.isready = false;";
        [super writeJavascript:statusJS];
    }
}

-(void) checkCardReaderStatus
{
    if (uniReader.getRunningTask == UMTASK_NONE)
    {
        NSLog(@"UMTASK_NONE");
        UmRet ret = [uniReader startUniMag:TRUE];
        NSLog(@"Running Task 5:");
        [self logCurrentTask];
        [uniReader requestSwipe];
    }
    if (uniReader.getRunningTask == UMTASK_CONNECT)
    {
        NSLog(@"UMTASK_CONNECT");
    }
    if (uniReader.getRunningTask == UMTASK_SWIPE)
    {
        NSLog(@"UMTASK_SWIPE");
    }
    if (uniReader.getRunningTask == UMTASK_CMD)
    {
        NSLog(@"UMTASK_CMD");
    }
    if (uniReader.getRunningTask == UMTASK_FW_UPDATE)
    {
        NSLog(@"UMTASK_FW_UPDATE");
    }
}





//called when uniMag is physically attached
- (void)umDevice_attachment:(NSNotification *)notification {
    NSLog(@"umDevice_attachment called");
    [self logCurrentTask];
    [self changeJSStatusVariable];
}

//called when uniMag is physically detached
- (void)umDevice_detachment:(NSNotification *)notification {
    NSLog(@"umDevice_detachment called");
    [self logCurrentTask];
    [self changeJSStatusVariable];
}

//called when attempting to start the connection task but iDevice's headphone playback volume is too low
- (void)umConnection_lowVolume:(NSNotification *)notification {
    NSLog(@"umConnection_lowVolume called");
    [self logCurrentTask];
    [self changeJSStatusVariable];
}

//called when successfully starting the connection task
- (void)umConnection_starting:(NSNotification *)notification {
    NSLog(@"umConnection_starting called");
    [self logCurrentTask];
    [self changeJSStatusVariable];
}

//called when SDK failed to handshake with reader in time. ie, the connection task has timed out
- (void)umConnection_timeout:(NSNotification *)notification {
    NSLog(@"umConnection_timeout called");
    [self logCurrentTask];
    [self changeJSStatusVariable];
}

//called when the connection task is successful. SDK's connection state changes to true
- (void)umConnection_connected:(NSNotification *)notification {
    NSLog(@"umConnection_connected called");
    [self logCurrentTask];
    [self changeJSStatusVariable];
}

//called when SDK's connection state changes to false. This happens when reader becomes
// physically detached or when a disconnect API is called
- (void)umConnection_disconnected:(NSNotification *)notification {
    NSLog(@"umConnection_disconnected called");
    [self logCurrentTask];
    [self changeJSStatusVariable];
}

//called when the swipe task is successfully starting, meaning the SDK starts to
// wait for a swipe to be made
- (void)umSwipe_starting:(NSNotification *)notification {
    NSLog(@"umSwipe_starting called");
    [self logCurrentTask];
    [self changeJSStatusVariable];
}

//called when the SDK hasn't received a swipe from the device within a configured
// "swipe timeout interval".
- (void)umSwipe_timeout:(NSNotification *)notification {
    NSLog(@"umSwipe_timeout called");
    [self logCurrentTask];
    [self changeJSStatusVariable];
}

//called when the SDK has read something from the uniMag device
// (eg a swipe, a response to a command) and is in the process of decoding it
// Use this to provide an early feedback on the UI
- (void)umDataProcessing:(NSNotification *)notification {
    NSLog(@"umDataProcessing called");
    [self logCurrentTask];
    [self changeJSStatusVariable];
}

//called when SDK failed to read a valid card swipe
- (void)umSwipe_invalid:(NSNotification *)notification {
    NSLog(@"umSwipe_invalid called");
    [self logCurrentTask];
    [self changeJSStatusVariable];
}

//called when SDK received a swipe successfully
- (void)umSwipe_receivedSwipe:(NSNotification *)notification {
    NSLog(@"umSwipe_receivedSwipe called");
    [self logCurrentTask];
    [self changeJSStatusVariable];
	NSString *text = [[NSString alloc] initWithData:[notification object] encoding:NSUTF8StringEncoding];
    
    // REMOVE LINE BREAKS
    scannedData = [[text componentsSeparatedByCharactersInSet:[NSCharacterSet newlineCharacterSet]] componentsJoinedByString:@" "];
    
    NSString* orig = [NSString stringWithFormat:@"UniMagReader.ccdata = '%@';", scannedData];
    [super writeJavascript:orig];
}

//called when SDK successfully starts to send a command. SDK starts the command
// task
- (void)umCommand_starting:(NSNotification *)notification {
    NSLog(@"umCommand_starting called");
    [self logCurrentTask];
    [self changeJSStatusVariable];
}

//called when SDK failed to receive a command response within a configured
// "command timeout interval"
- (void)umCommand_timeout:(NSNotification *)notification {
    NSLog(@"umCommand_timeout called");
    [self logCurrentTask];
    [self changeJSStatusVariable];
}

//called when SDK successfully received a response to a command
- (void)umCommand_receivedResponse:(NSNotification *)notification {
    NSLog(@"umCommand_receivedResponse called");
    [self logCurrentTask];
    [self changeJSStatusVariable];
}


-(void) umsdk_registerObservers:(BOOL) reg {
	NSNotificationCenter *nc = [NSNotificationCenter defaultCenter];
    
    //list of notifications and their corresponding selector
    const struct {__unsafe_unretained NSString *n; SEL s;} noteAndSel[] = {
        //
        {uniMagAttachmentNotification       , @selector(umDevice_attachment:)},
        {uniMagDetachmentNotification       , @selector(umDevice_detachment:)},
        //
        {uniMagInsufficientPowerNotification, @selector(umConnection_lowVolume:)},
        {uniMagPoweringNotification         , @selector(umConnection_starting:)},
        {uniMagTimeoutNotification          , @selector(umConnection_timeout:)},
        {uniMagDidConnectNotification       , @selector(umConnection_connected:)},
        {uniMagDidDisconnectNotification    , @selector(umConnection_disconnected:)},
        //
        {uniMagSwipeNotification            , @selector(umSwipe_starting:)},
        {uniMagTimeoutSwipeNotification     , @selector(umSwipe_timeout:)},
        {uniMagDataProcessingNotification   , @selector(umDataProcessing:)},
        {uniMagInvalidSwipeNotification     , @selector(umSwipe_invalid:)},
        {uniMagDidReceiveDataNotification   , @selector(umSwipe_receivedSwipe:)},
        //
        {uniMagCmdSendingNotification       , @selector(umCommand_starting:)},
        {uniMagCommandTimeoutNotification   , @selector(umCommand_timeout:)},
        {uniMagDidReceiveCmdNotification    , @selector(umCommand_receivedResponse:)},
        //
        {uniMagSystemMessageNotification    , @selector(umSystemMessage:)},
        
        {nil, nil},
    };
    
    //register or unregister
    for (int i=0; noteAndSel[i].s != nil ;i++) {
        if (reg)
            [nc addObserver:self selector:noteAndSel[i].s name:noteAndSel[i].n object:nil];
        else
            [nc removeObserver:self name:noteAndSel[i].n object:nil];
    }
}

-(void) umsdk_activate {
    
    //register observers for all uniMag notifications
	[self umsdk_registerObservers:TRUE];
    
    
	//enable info level NSLogs inside SDK
    // Here we turn on before initializing SDK object so the act of initializing is logged
    [uniMag enableLogging:TRUE];
    
    //initialize the SDK by creating a uniMag class object
    uniReader = [[uniMag alloc] init];
    
    /*
     //set SDK to perform the connect task automatically when headset is attached
     [uniReader setAutoConnect:TRUE];
     */
    
    //set swipe timeout to infinite. By default, swipe task will timeout after 20 seconds
	[uniReader setSwipeTimeoutDuration:0];
    
    //make SDK maximize the volume automatically during connection
    [uniReader setAutoAdjustVolume:TRUE];
    
    //By default, the diagnostic wave file logged by the SDK is stored under the temp directory
    // Here it is set to be under the Documents folder in the app sandbox so the log can be accessed
    // through iTunes file sharing. See UIFileSharingEnabled in iOS doc.
    [uniReader setWavePath: [NSHomeDirectory() stringByAppendingPathComponent: @"/Documents/audio.caf"]];
}

@end