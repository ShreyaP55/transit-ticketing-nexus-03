
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { IPass } from '@/types';
import { generateSecurePassQRCode } from '@/utils/passQRSecurity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { getRouteDisplay } from '@/utils/typeGuards';

interface PassQRCodeProps {
  pass: IPass;
  className?: string;
}

export const PassQRCode: React.FC<PassQRCodeProps> = ({ pass, className }) => {
  const qrData = generateSecurePassQRCode({
    passId: pass._id,
    userId: pass.userId,
    routeId: typeof pass.routeId === 'string' ? pass.routeId : pass.routeId._id,
    expiryDate: pass.expiryDate,
  });

  const routeDisplay = getRouteDisplay(pass.routeId);
  const isExpired = new Date(pass.expiryDate) < new Date();

  return (
    <Card className={`${className} ${isExpired ? 'opacity-50' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center text-card-foreground">
          <QrCode className="mr-2 h-5 w-5 text-primary" />
          Pass QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <QRCodeSVG
              value={qrData}
              size={200}
              level="M"
              includeMargin={true}
            />
          </div>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Route:</span>
            <span className="font-medium">{routeDisplay}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Valid until:</span>
            <span className="font-medium">
              {format(new Date(pass.expiryDate), 'MMM d, yyyy')}
            </span>
          </div>
          
          <div className="text-center">
            <span className="text-xs text-muted-foreground">
              Pass ID: {pass._id.substring(0, 8)}...
            </span>
          </div>
        </div>
        
        {isExpired && (
          <div className="text-center">
            <span className="text-red-600 font-medium text-sm">
              ⚠️ This pass has expired
            </span>
          </div>
        )}
        
        <div className="bg-secondary/50 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Show this QR code to the bus conductor or scan at the station for verification
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
