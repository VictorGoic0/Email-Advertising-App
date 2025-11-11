import { useParams } from 'react-router-dom';
import CampaignReview from '@/components/CampaignReview';

/**
 * CampaignReviewPage - Page for reviewing a specific campaign
 */
export default function CampaignReviewPage() {
  const { id } = useParams();

  return <CampaignReview campaignId={id} />;
}

