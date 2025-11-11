import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * RejectionModal - Modal for entering rejection reason
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onSubmit - Function to submit rejection (receives reason as parameter)
 * @param {boolean} props.loading - Whether submission is in progress
 */
export default function RejectionModal({ open, onClose, onSubmit, loading = false }) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate rejection reason
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    setError('');
    onSubmit(rejectionReason.trim());
  };

  const handleClose = () => {
    setRejectionReason('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <Card className="relative z-50 w-full max-w-md mx-4 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reject Campaign</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide a reason for rejecting this campaign..."
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  setError('');
                }}
                rows={4}
                className={error ? 'border-destructive' : ''}
                disabled={loading}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={loading || !rejectionReason.trim()}
              >
                {loading ? 'Submitting...' : 'Submit Rejection'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

