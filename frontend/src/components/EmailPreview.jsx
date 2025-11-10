import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEVICE_VIEWS = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
};

/**
 * EmailPreview - Component for rendering email HTML in an iframe
 * @param {Object} props
 * @param {string} props.emailHtml - The HTML content to render
 */
export default function EmailPreview({ emailHtml }) {
  const [deviceView, setDeviceView] = useState(DEVICE_VIEWS.DESKTOP);

  if (!emailHtml) {
    return (
      <div className="flex items-center justify-center h-96 border border-dashed border-border rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground">No email content to preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Device Toggle Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Preview:</span>
          <div className="flex items-center gap-1 border border-input rounded-md p-1 bg-background">
            <Button
              variant={deviceView === DEVICE_VIEWS.DESKTOP ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceView(DEVICE_VIEWS.DESKTOP)}
              className="h-8 px-3"
            >
              <Monitor className="h-4 w-4 mr-1.5" />
              Desktop
            </Button>
            <Button
              variant={deviceView === DEVICE_VIEWS.MOBILE ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceView(DEVICE_VIEWS.MOBILE)}
              className="h-8 px-3"
            >
              <Smartphone className="h-4 w-4 mr-1.5" />
              Mobile
            </Button>
          </div>
        </div>
      </div>

      {/* Email Preview Container */}
      <div
        className={`border border-border rounded-lg bg-white overflow-hidden shadow-sm ${
          deviceView === DEVICE_VIEWS.MOBILE
            ? 'max-w-sm mx-auto'
            : 'w-full'
        }`}
      >
        <div
          className={`bg-muted/30 border-b border-border p-2 ${
            deviceView === DEVICE_VIEWS.MOBILE ? 'px-4' : 'px-6'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            {deviceView === DEVICE_VIEWS.MOBILE && (
              <div className="ml-auto text-xs text-muted-foreground">
                Mobile View
              </div>
            )}
          </div>
        </div>
        <div
          className={`overflow-auto bg-white ${
            deviceView === DEVICE_VIEWS.MOBILE
              ? 'max-h-[600px]'
              : 'max-h-[800px]'
          }`}
          style={{
            // Custom scrollbar styling
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
          }}
        >
          <iframe
            srcDoc={emailHtml}
            sandbox="allow-same-origin"
            className={`w-full border-0 ${
              deviceView === DEVICE_VIEWS.MOBILE
                ? 'min-h-[600px]'
                : 'min-h-[800px]'
            }`}
            title="Email Preview"
            style={{
              // Ensure iframe renders correctly
              display: 'block',
            }}
          />
        </div>
      </div>
    </div>
  );
}

