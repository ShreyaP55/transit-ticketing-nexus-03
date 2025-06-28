
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, CheckCircle, XCircle, Clock, MapPin, User, Calendar } from 'lucide-react';
import { validatePassQRCode } from '@/utils/passQRSecurity';
import { passesAPI } from '@/services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useUser } from '@/context/UserContext';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannedPassData {
  passId: string;
  userId: string;
  routeId: string;
  expiryDate: string;
  isValid: boolean;
  error?: string;
}

const PassQRScanner: React.FC = () => {
  const { userId: adminUserId, user } = useUser();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedPassData | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  const startScanning = () => {
    setIsScanning(true);
    setScannedData(null);
    
    const qrScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    
    qrScanner.render(
      (decodedText) => {
        handleScanSuccess(decodedText);
        qrScanner.clear();
        setIsScanning(false);
      },
      (error) => {
        console.log("QR scan error:", error);
      }
    );
    
    setScanner(qrScanner);
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setIsScanning(false);
  };

  const handleScanSuccess = (qrData: string) => {
    const validation = validatePassQRCode(qrData);
    
    if (validation.isValid && validation.passData) {
      setScannedData({
        ...validation.passData,
        isValid: true
      });
      toast.success("Pass QR code scanned successfully!");
    } else {
      setScannedData({
        passId: '',
        userId: '',
        routeId: '',
        expiryDate: '',
        isValid: false,
        error: validation.error || 'Invalid QR code'
      });
      toast.error(validation.error || "Invalid pass QR code");
    }
  };

  const recordUsage = async (location?: string) => {
    if (!scannedData || !scannedData.isValid || !adminUserId) return;
    
    setIsRecording(true);
    try {
      await passesAPI.recordPassUsage({
        passId: scannedData.passId,
        location: location || 'Bus Station',
        stationName: location || 'Bus Station'
      });
      
      toast.success("Pass usage recorded successfully!");
      
      // Reset for next scan
      setScannedData(null);
    } catch (error: any) {
      console.error('Error recording pass usage:', error);
      toast.error(error.message || "Failed to record pass usage");
    } finally {
      setIsRecording(false);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    stopScanning();
  };

  if (!user || user.role !== 'admin') {
    return (
      <Card className="bg-card border-border shadow-md">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-medium mb-2 text-card-foreground">Access Denied</h3>
            <p className="text-muted-foreground">
              You need admin privileges to access the pass scanner
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-card-foreground">
          <QrCode className="mr-2 h-5 w-5 text-primary" />
          Pass QR Scanner
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isScanning && !scannedData && (
          <div className="text-center py-8">
            <QrCode className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2 text-card-foreground">
              Scan Pass QR Code
            </h3>
            <p className="text-muted-foreground mb-4">
              Click the button below to start scanning user pass QR codes
            </p>
            <Button onClick={startScanning} className="px-6">
              Start Scanning
            </Button>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div id="qr-reader" className="w-full"></div>
            <div className="text-center">
              <Button variant="outline" onClick={stopScanning}>
                Stop Scanning
              </Button>
            </div>
          </div>
        )}

        {scannedData && (
          <div className="space-y-4">
            <Card className={`${scannedData.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {scannedData.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {scannedData.isValid ? 'Valid Pass' : 'Invalid Pass'}
                    </span>
                  </div>
                  <Badge variant={scannedData.isValid ? "default" : "destructive"}>
                    {scannedData.isValid ? 'Active' : 'Invalid'}
                  </Badge>
                </div>

                {scannedData.isValid ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="font-medium">{scannedData.userId.substring(0, 12)}...</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Route ID:</span>
                      <span className="font-medium">{scannedData.routeId.substring(0, 12)}...</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Valid until:</span>
                      <span className="font-medium">
                        {format(new Date(scannedData.expiryDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600 text-sm">
                    <strong>Error:</strong> {scannedData.error}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              {scannedData.isValid && (
                <Button
                  onClick={() => recordUsage()}
                  disabled={isRecording}
                  className="flex-1"
                >
                  {isRecording ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Record Usage
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={resetScanner} className="flex-1">
                Scan Another
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PassQRScanner;
