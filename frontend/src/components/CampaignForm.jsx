import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const campaignSchema = z.object({
  campaign_name: z.string().min(1, 'Campaign name is required').max(255, 'Campaign name must be less than 255 characters'),
  target_audience: z.string().optional(),
  campaign_goal: z.string().optional(),
  additional_notes: z.string().optional(),
});

/**
 * CampaignForm component for creating/editing campaigns
 */
export default function CampaignForm({ onSubmit, initialData = null, isLoading = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: initialData || {
      campaign_name: '',
      target_audience: '',
      campaign_goal: '',
      additional_notes: '',
    },
  });

  const onSubmitForm = (data) => {
    // Remove empty optional fields
    const cleanedData = {
      campaign_name: data.campaign_name.trim(),
      target_audience: data.target_audience?.trim() || null,
      campaign_goal: data.campaign_goal?.trim() || null,
      additional_notes: data.additional_notes?.trim() || null,
    };
    onSubmit(cleanedData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Details</CardTitle>
        <CardDescription>
          Provide information about your campaign to help generate the perfect email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="campaign_name">
              Campaign Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="campaign_name"
              placeholder="e.g., Summer Sale 2024"
              {...register('campaign_name')}
              className={errors.campaign_name ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.campaign_name && (
              <p className="text-sm text-destructive">{errors.campaign_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_audience">Target Audience</Label>
            <Textarea
              id="target_audience"
              placeholder="Describe your target audience (e.g., young professionals aged 25-35, interested in technology)"
              rows={3}
              {...register('target_audience')}
              className={errors.target_audience ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.target_audience && (
              <p className="text-sm text-destructive">{errors.target_audience.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign_goal">Campaign Goal</Label>
            <Textarea
              id="campaign_goal"
              placeholder="What do you want to achieve with this campaign? (e.g., increase sales, promote new product, build brand awareness)"
              rows={3}
              {...register('campaign_goal')}
              className={errors.campaign_goal ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.campaign_goal && (
              <p className="text-sm text-destructive">{errors.campaign_goal.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional_notes">Additional Notes</Label>
            <Textarea
              id="additional_notes"
              placeholder="Any additional information or specific requirements for the email"
              rows={4}
              {...register('additional_notes')}
              className={errors.additional_notes ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.additional_notes && (
              <p className="text-sm text-destructive">{errors.additional_notes.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating Campaign...' : initialData ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

