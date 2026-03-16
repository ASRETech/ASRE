// Review Management — Track reviews, generate AI review requests and responses
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, StarHalf, MessageSquare, Send, Copy, Check, Loader2, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { nanoid } from 'nanoid';

const PLATFORMS = [
  { id: 'google', label: 'Google', color: 'text-blue-500' },
  { id: 'zillow', label: 'Zillow', color: 'text-blue-600' },
  { id: 'realtor', label: 'Realtor.com', color: 'text-red-500' },
  { id: 'facebook', label: 'Facebook', color: 'text-blue-700' },
  { id: 'other', label: 'Other', color: 'text-muted-foreground' },
];

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />);
    } else if (i - 0.5 <= rating) {
      stars.push(<StarHalf key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />);
    } else {
      stars.push(<Star key={i} className="w-3.5 h-3.5 text-muted-foreground/20" />);
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

export default function ReviewsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [responseOpen, setResponseOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    platform: 'google' as string, reviewerName: '', rating: 5, reviewText: '', transactionAddress: '',
  });
  const [requestForm, setRequestForm] = useState({ clientName: '', transactionAddress: '', platform: 'google' });
  const [responseReviewText, setResponseReviewText] = useState('');

  const reviewsQuery = trpc.reviews.list.useQuery();
  const createMutation = trpc.reviews.create.useMutation({
    onSuccess: () => { reviewsQuery.refetch(); setAddOpen(false); setForm({ platform: 'google', reviewerName: '', rating: 5, reviewText: '', transactionAddress: '' }); toast.success('Review added'); },
  });
  // AI request generation uses the same generateResponse endpoint with a custom prompt
  const generateRequestMutation = trpc.reviews.generateResponse.useMutation();
  const generateResponseMutation = trpc.reviews.generateResponse.useMutation();

  const reviews = (reviewsQuery.data || []) as any[];

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0;
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    reviews.forEach(r => { counts[r.platform || 'other'] = (counts[r.platform || 'other'] || 0) + 1; });
    return counts;
  }, [reviews]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold">Review Management</h1>
            <p className="text-xs text-muted-foreground mt-1">{reviews.length} reviews — {avgRating.toFixed(1)} avg rating</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-xs h-8">
                  <Send className="w-3 h-3 mr-1" /> AI Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle className="font-display">Generate Review Request</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <div><Label className="text-xs">Client Name</Label><Input value={requestForm.clientName} onChange={(e) => setRequestForm(f => ({ ...f, clientName: e.target.value }))} className="h-8 text-sm" /></div>
                  <div><Label className="text-xs">Transaction Address</Label><Input value={requestForm.transactionAddress} onChange={(e) => setRequestForm(f => ({ ...f, transactionAddress: e.target.value }))} className="h-8 text-sm" /></div>
                  <div>
                    <Label className="text-xs">Platform</Label>
                    <Select value={requestForm.platform} onValueChange={(v) => setRequestForm(f => ({ ...f, platform: v }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map(p => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full bg-[#DC143C] hover:bg-[#B01030] text-white text-xs"
                    disabled={!requestForm.clientName || generateRequestMutation.isPending}
                    onClick={() => generateRequestMutation.mutate({ reviewerName: requestForm.clientName, rating: 5, reviewText: `Please generate a review request message to send to ${requestForm.clientName} after closing on ${requestForm.transactionAddress || 'their property'}. Platform: ${requestForm.platform}` })}
                  >
                    {generateRequestMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                    Generate Request Message
                  </Button>
                  {generateRequestMutation.data?.response && (
                    <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                      <p className="text-sm whitespace-pre-wrap mb-2">{generateRequestMutation.data.response}</p>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => copyToClipboard(generateRequestMutation.data!.response, 'request')}>
                        {copiedText === 'request' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />} Copy
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#DC143C] hover:bg-[#B01030] text-white text-xs h-8">
                  <Plus className="w-3 h-3 mr-1" /> Add Review
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle className="font-display">Add Review</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Platform</Label>
                      <Select value={form.platform} onValueChange={(v) => setForm(f => ({ ...f, platform: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PLATFORMS.map(p => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Rating</Label>
                      <Select value={String(form.rating)} onValueChange={(v) => setForm(f => ({ ...f, rating: parseInt(v) }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map(r => <SelectItem key={r} value={String(r)}>{r} Star{r !== 1 ? 's' : ''}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label className="text-xs">Reviewer Name</Label><Input value={form.reviewerName} onChange={(e) => setForm(f => ({ ...f, reviewerName: e.target.value }))} className="h-8 text-sm" /></div>
                  <div><Label className="text-xs">Transaction Address</Label><Input value={form.transactionAddress} onChange={(e) => setForm(f => ({ ...f, transactionAddress: e.target.value }))} className="h-8 text-sm" /></div>
                  <div><Label className="text-xs">Review Text</Label><Textarea value={form.reviewText} onChange={(e) => setForm(f => ({ ...f, reviewText: e.target.value }))} className="text-sm min-h-[80px]" /></div>
                  <Button className="w-full bg-[#DC143C] hover:bg-[#B01030] text-white text-xs" disabled={!form.reviewerName} onClick={() => createMutation.mutate({ reviewId: nanoid(), platform: form.platform as any, reviewerName: form.reviewerName, rating: form.rating, reviewText: form.reviewText })}>
                    Add Review
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3 text-center">
            <div className="text-lg font-mono font-bold">{reviews.length}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Total Reviews</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-lg font-mono font-bold">{avgRating.toFixed(1)}</span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-[10px] text-muted-foreground uppercase">Avg Rating</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-lg font-mono font-bold">{reviews.filter(r => r.rating === 5).length}</div>
            <div className="text-[10px] text-muted-foreground uppercase">5-Star</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-lg font-mono font-bold">{reviews.filter(r => r.agentResponse).length}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Responded</div>
          </Card>
        </div>

        {/* Platform breakdown */}
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => (
            <Badge key={p.id} variant="outline" className={`text-xs ${p.color}`}>
              {p.label}: {platformCounts[p.id] || 0}
            </Badge>
          ))}
        </div>

        {/* Reviews list */}
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <Card className="p-8 text-center">
              <Star className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <h3 className="text-sm font-semibold mb-1">No Reviews Yet</h3>
              <p className="text-xs text-muted-foreground">Add your first review or generate an AI review request to send to clients.</p>
            </Card>
          ) : (
            reviews.map((review: any) => {
              const platform = PLATFORMS.find(p => p.id === review.platform);
              return (
                <Card key={review.reviewId || review.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-display font-bold text-sm shrink-0">
                        {(review.reviewerName || 'R').charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{review.reviewerName || 'Anonymous'}</div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating || 5} />
                          <Badge variant="outline" className={`text-[9px] ${platform?.color || ''}`}>{platform?.label || review.platform}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {review.reviewDate ? new Date(review.reviewDate).toLocaleDateString() : ''}
                    </div>
                  </div>
                  {review.reviewText && <p className="text-sm text-muted-foreground mb-3">{review.reviewText}</p>}
                  {review.transactionAddress && (
                    <div className="text-[10px] text-muted-foreground mb-2">Property: {review.transactionAddress}</div>
                  )}
                  {review.agentResponse ? (
                    <div className="p-3 rounded-lg bg-muted/50 border-l-2 border-[#DC143C]">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Your Response</div>
                      <p className="text-sm">{review.agentResponse}</p>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => {
                        setSelectedReviewId(review.reviewId || String(review.id));
                        setResponseReviewText(review.reviewText || '');
                        setResponseOpen(true);
                        generateResponseMutation.mutate({
                          reviewText: review.reviewText || '',
                          rating: review.rating || 5,
                          reviewerName: review.reviewerName || 'Client',
                        });
                      }}
                    >
                      <Sparkles className="w-3 h-3 mr-1" /> Generate AI Response
                    </Button>
                  )}
                </Card>
              );
            })
          )}
        </div>

        {/* AI Response Dialog */}
        <Dialog open={responseOpen} onOpenChange={setResponseOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="font-display">AI Response</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              {generateResponseMutation.isPending ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#DC143C]" />
                  <span className="text-sm text-muted-foreground ml-2">Generating response...</span>
                </div>
              ) : generateResponseMutation.data?.response ? (
                <>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-sm whitespace-pre-wrap">{generateResponseMutation.data.response}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs w-full" onClick={() => copyToClipboard(generateResponseMutation.data!.response, 'response')}>
                    {copiedText === 'response' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />} Copy Response
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No response generated yet.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
