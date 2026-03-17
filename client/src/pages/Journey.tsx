// Journey — Two-tab layout: Feed (social) + My Map (MREA progression)
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { LEVELS } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Flame, TrendingUp, Zap, Heart, Star,
  MessageSquare, Globe, Users, Lock,
  CheckCircle2, ChevronDown, ChevronRight,
  Send, Loader2, Award, MapPin, Check,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';

// ── Constants ───────────────────────────────────────────────────────
const LEVEL_NAMES = [
  'Solo Agent', 'First Admin Hire', "First Buyer's Agent",
  "Multiple Buyer's Agents", 'Listings Specialist', 'Full Team', 'Business Owner',
];

const REACTIONS = [
  { type: 'fire',        emoji: '\u{1F525}', label: 'Fire' },
  { type: 'leveling_up', emoji: '\u{1F4C8}', label: 'Leveling up' },
  { type: 'lets_go',     emoji: '\u{1F4AA}', label: "Let's go" },
  { type: 'been_there',  emoji: '\u{1F64C}', label: 'Been there' },
];

const VISIBILITY_CONFIG: Record<string, { icon: React.ReactNode; label: string }> = {
  private:   { icon: <Lock className="w-3 h-3" />,   label: 'Only me' },
  cohort:    { icon: <Users className="w-3 h-3" />,   label: 'My cohort' },
  community: { icon: <Globe className="w-3 h-3" />,   label: 'Community' },
  network:   { icon: <MapPin className="w-3 h-3" />,  label: 'KW Network' },
};

const POST_TYPE_ICONS: Record<string, React.ReactNode> = {
  level_advance:        <Award className="w-4 h-4 text-[#DC143C]" />,
  deliverable_complete: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  team_hire:            <Users className="w-4 h-4 text-blue-500" />,
  production_milestone: <TrendingUp className="w-4 h-4 text-amber-500" />,
  certification:        <Star className="w-4 h-4 text-[#DC143C]" />,
  streak:               <Flame className="w-4 h-4 text-orange-500" />,
  coaching_milestone:   <Heart className="w-4 h-4 text-purple-500" />,
  culture_win:          <Zap className="w-4 h-4 text-teal-500" />,
  custom:               <MessageSquare className="w-4 h-4 text-muted-foreground" />,
};

// ── Post Card Component ─────────────────────────────────────────────
function PostCard({ post, isCoach }: { post: any; isCoach: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [myExperience, setMyExperience] = useState('');
  const [whatHelped, setWhatHelped] = useState('');
  const [showStructured, setShowStructured] = useState(false);

  const utils = trpc.useUtils();
  const reactMutation = trpc.journey.react.useMutation({
    onSuccess: () => utils.journey.getFeed.invalidate(),
  });
  const commentMutation = trpc.journey.addComment.useMutation({
    onSuccess: () => {
      setCommentText('');
      setMyExperience('');
      setWhatHelped('');
      setShowCommentForm(false);
      utils.journey.getFeed.invalidate();
      toast.success('Comment posted');
    },
    onError: (e) => toast.error(e.message),
  });

  const { data: detail } = trpc.journey.getPostDetail.useQuery(
    { postId: post.postId },
    { enabled: expanded }
  );

  const reactionsByType = post.reactionCounts || {};
  const totalReactions = Object.values(reactionsByType as Record<string, number>).reduce(
    (s: number, n: number) => s + n, 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border bg-background overflow-hidden ${
        post.isFeatured
          ? 'border-amber-400/40 shadow-[0_0_0_1px_rgba(186,117,23,0.2)]'
          : 'border-border/60'
      }`}
    >
      {post.isFeatured && (
        <div className="px-4 py-1.5 bg-amber-500/8 border-b border-amber-500/15 flex items-center gap-1.5">
          <Star className="w-3 h-3 text-amber-500" />
          <span className="text-[10px] font-medium text-amber-600">Featured by coach</span>
        </div>
      )}

      <div className="p-4">
        {/* Author row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#DC143C]/10 flex items-center justify-center
            text-[#DC143C] font-bold text-sm shrink-0">
            {(post.author?.name || 'A').charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{post.author?.name}</span>
              {post.author?.isCoach && (
                <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-500/20">
                  Coach
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                Level {post.author?.currentLevel}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
              <span className="text-muted-foreground/40 text-[10px]">&middot;</span>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                {VISIBILITY_CONFIG[post.visibility]?.icon}
                {VISIBILITY_CONFIG[post.visibility]?.label}
              </div>
            </div>
          </div>
          <div className="shrink-0">
            {POST_TYPE_ICONS[post.type]}
          </div>
        </div>

        {/* Headline */}
        <div className="text-sm font-semibold mb-1">{post.headline}</div>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {post.caption}
          </p>
        )}

        {/* Reaction bar */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <div className="flex gap-1">
            {REACTIONS.map(r => (
              <button
                key={r.type}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px]
                  transition-all hover:bg-muted/50 ${
                  post.userReaction === r.type
                    ? 'bg-[#DC143C]/8 text-[#DC143C] font-medium'
                    : 'text-muted-foreground'
                }`}
                onClick={() => reactMutation.mutate({ postId: post.postId, type: r.type as any })}
                disabled={reactMutation.isPending}
              >
                <span style={{ fontSize: 14 }}>{r.emoji}</span>
                {(reactionsByType[r.type] || 0) > 0 && (
                  <span>{reactionsByType[r.type]}</span>
                )}
              </button>
            ))}
            {isCoach && (
              <button
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px]
                  transition-all hover:bg-amber-500/10 ${
                  post.userReaction === 'coach_feature'
                    ? 'bg-amber-500/15 text-amber-600 font-medium'
                    : 'text-muted-foreground'
                }`}
                onClick={() => reactMutation.mutate({ postId: post.postId, type: 'coach_feature' })}
              >
                <span style={{ fontSize: 14 }}>{'\u2B50'}</span>
              </button>
            )}
          </div>

          <button
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground
              hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/50"
            onClick={() => setShowCommentForm(v => !v)}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {post.commentsCount > 0 ? post.commentsCount : 'Comment'}
          </button>
        </div>

        {/* Comment preview */}
        {!expanded && post.commentPreview && post.commentPreview.length > 0 && (
          <div className="mt-3 space-y-2">
            {post.commentPreview.map((c: any) => (
              <div key={c.commentId} className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center
                  text-[10px] font-bold shrink-0">
                  {(c.userId || '?').toString().charAt(0)}
                </div>
                <div className="flex-1 bg-muted/30 rounded-lg px-3 py-2">
                  <p className="text-xs leading-relaxed">{c.body}</p>
                </div>
              </div>
            ))}
            {post.commentsCount > 2 && (
              <button
                className="text-[11px] text-muted-foreground hover:text-foreground ml-8"
                onClick={() => setExpanded(true)}
              >
                View all {post.commentsCount} comments &rarr;
              </button>
            )}
          </div>
        )}

        {/* Expanded comments */}
        <AnimatePresence>
          {expanded && detail && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 space-y-3 overflow-hidden"
            >
              {detail.comments.map((c: any) => (
                <div key={c.commentId} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#DC143C]/10 flex items-center justify-center
                    text-[10px] font-bold text-[#DC143C] shrink-0">
                    {(c.author?.name || 'A').charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="bg-muted/30 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-semibold">{c.author?.name}</span>
                        {c.author?.isCoach && (
                          <Badge variant="outline" className="text-[9px] text-purple-600 py-0">Coach</Badge>
                        )}
                        <span className="text-[9px] text-muted-foreground">
                          Lvl {c.author?.currentLevel}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">{c.body}</p>
                      {c.myExperience && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <span className="text-[10px] text-muted-foreground font-medium">
                            My experience:{' '}
                          </span>
                          <span className="text-xs text-muted-foreground">{c.myExperience}</span>
                        </div>
                      )}
                      {c.whatHelped && (
                        <div className="mt-1">
                          <span className="text-[10px] text-muted-foreground font-medium">
                            What helped:{' '}
                          </span>
                          <span className="text-xs text-muted-foreground">{c.whatHelped}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground ml-3">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
              <button
                className="text-[11px] text-muted-foreground hover:text-foreground"
                onClick={() => setExpanded(false)}
              >
                Collapse
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comment form */}
        <AnimatePresence>
          {showCommentForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t border-border/50 overflow-hidden"
            >
              <Textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                className="min-h-[64px] text-xs resize-none mb-2"
              />

              {showStructured ? (
                <div className="space-y-2 mb-2">
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-1">
                      My experience with this milestone (optional)
                    </div>
                    <Textarea
                      value={myExperience}
                      onChange={e => setMyExperience(e.target.value)}
                      placeholder="What was it like when you hit this milestone?"
                      className="min-h-[52px] text-xs resize-none"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-1">
                      What helped me most (optional)
                    </div>
                    <Textarea
                      value={whatHelped}
                      onChange={e => setWhatHelped(e.target.value)}
                      placeholder="Advice you'd give someone at this stage..."
                      className="min-h-[52px] text-xs resize-none"
                    />
                  </div>
                </div>
              ) : (
                <button
                  className="text-[10px] text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1"
                  onClick={() => setShowStructured(true)}
                >
                  <ChevronDown className="w-3 h-3" />
                  Add your experience (helps others at this stage)
                </button>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="text-xs h-7"
                  onClick={() => setShowCommentForm(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="bg-[#DC143C] text-white text-xs h-7"
                  disabled={!commentText.trim() || commentMutation.isPending}
                  onClick={() => commentMutation.mutate({
                    postId: post.postId,
                    body: commentText,
                    myExperience: myExperience || undefined,
                    whatHelped: whatHelped || undefined,
                  })}>
                  {commentMutation.isPending
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <><Send className="w-3 h-3 mr-1" /> Post</>}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Draft Post Card ─────────────────────────────────────────────────
function DraftPostCard({ post }: { post: any }) {
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<string>('cohort');
  const [expanded, setExpanded] = useState(false);

  const utils = trpc.useUtils();
  const publishMutation = trpc.journey.publishPost.useMutation({
    onSuccess: () => {
      utils.journey.getDrafts.invalidate();
      utils.journey.getFeed.invalidate();
      toast.success('Posted to your journey feed');
    },
    onError: (e) => toast.error(e.message),
  });
  const discardMutation = trpc.journey.discardDraft.useMutation({
    onSuccess: () => utils.journey.getDrafts.invalidate(),
  });

  return (
    <div className="p-3 rounded-xl border border-dashed border-border/80 bg-muted/20">
      <div className="flex items-start gap-2 mb-2">
        <div className="shrink-0 mt-0.5">{POST_TYPE_ICONS[post.type]}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium">{post.headline}</div>
          <div className="text-[10px] text-muted-foreground">Ready to share</div>
        </div>
      </div>

      {!expanded ? (
        <Button variant="outline" size="sm" className="w-full text-xs h-7"
          onClick={() => setExpanded(true)}>
          Review &amp; Post
        </Button>
      ) : (
        <div className="space-y-2">
          <Textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Add a personal note... (optional)"
            className="min-h-[60px] text-xs resize-none"
          />
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cohort" className="text-xs">My cohort only</SelectItem>
              <SelectItem value="community" className="text-xs">All AgentOS users</SelectItem>
              <SelectItem value="network" className="text-xs">KW Network</SelectItem>
              <SelectItem value="private" className="text-xs">Keep private</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 bg-[#DC143C] text-white text-xs h-7"
              disabled={publishMutation.isPending}
              onClick={() => publishMutation.mutate({
                postId: post.postId,
                caption: caption || undefined,
                visibility: visibility as any,
              })}>
              {publishMutation.isPending ? 'Posting...' : 'Post'}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground"
              onClick={() => discardMutation.mutate({ postId: post.postId })}>
              Discard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── My Map Tab (MREA Level Progression) ─────────────────────────────
function MyMapTab() {
  const { state } = useApp();
  const currentLevel = state.user?.currentLevel ?? 1;
  const deliverables = state.deliverables;

  const getLevelProgress = (level: number) => {
    const levelDeliverables = deliverables.filter(d => d.level === level);
    if (levelDeliverables.length === 0) return 0;
    const completed = levelDeliverables.filter(d => d.isComplete).length;
    return Math.round((completed / levelDeliverables.length) * 100);
  };

  const getLevelStatus = (level: number): 'complete' | 'in-progress' | 'locked' => {
    if (level < currentLevel) return 'complete';
    if (level === currentLevel) return 'in-progress';
    return 'locked';
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <MapPin className="w-3.5 h-3.5 text-[#DC143C]" />
          <span className="font-mono uppercase tracking-wider">MREA 7-Level Framework</span>
        </div>
        <p className="text-muted-foreground text-sm">
          Each level builds on the last. Complete your deliverables to advance.
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-[19px] sm:left-[27px] top-0 bottom-0 w-0.5 bg-border" />
        <div
          className="absolute left-[19px] sm:left-[27px] top-0 w-0.5 bg-[#DC143C] transition-all duration-1000 ease-out rounded-full"
          style={{ height: `${((currentLevel - 0.5) / 7) * 100}%` }}
        />

        <div className="space-y-4">
          {LEVELS.map((level, index) => {
            const status = getLevelStatus(level.level);
            const progress = getLevelProgress(level.level);
            const isLocked = status === 'locked';
            const isCurrent = status === 'in-progress';
            const isComplete = status === 'complete';

            return (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
              >
                <div className="flex gap-3 sm:gap-4">
                  <div className="relative z-10 shrink-0">
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-mono text-base sm:text-lg font-bold transition-all ${
                      isCurrent
                        ? 'bg-[#DC143C] text-white shadow-lg shadow-[#DC143C]/25'
                        : isComplete
                          ? 'bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/30'
                          : 'bg-muted text-muted-foreground/40 border border-border'
                    }`}>
                      {isComplete ? <Check className="w-6 h-6" /> : isLocked ? <Lock className="w-5 h-5" /> : level.level}
                    </div>
                  </div>

                  <Card className={`flex-1 p-5 transition-all duration-200 ${
                    isCurrent
                      ? 'border-[#DC143C]/30 bg-[#DC143C]/[0.02] shadow-sm'
                      : isLocked
                        ? 'opacity-50 bg-muted/30'
                        : 'hover:border-border/80'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-base font-semibold text-foreground">
                            {level.name}
                          </h3>
                          {isCurrent && (
                            <Badge variant="default" className="bg-[#DC143C] text-white text-[10px] px-2 py-0 h-5 font-mono">
                              CURRENT
                            </Badge>
                          )}
                          {isComplete && (
                            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px] px-2 py-0 h-5 font-mono">
                              COMPLETE
                            </Badge>
                          )}
                          {isLocked && (
                            <Badge variant="outline" className="text-muted-foreground/50 text-[10px] px-2 py-0 h-5 font-mono">
                              LOCKED
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{level.description}</p>
                      </div>
                    </div>

                    {!isLocked && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {level.deliverables.length} deliverables
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {progress}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )}

                    {isCurrent && (
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {level.deliverables.slice(0, 4).map((d) => {
                            const del = deliverables.find(dd => dd.id === d.id);
                            return (
                              <div key={d.id} className="flex items-center gap-2 text-xs">
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                  del?.isComplete
                                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500'
                                    : 'border-border'
                                }`}>
                                  {del?.isComplete && <Check className="w-2.5 h-2.5" />}
                                </div>
                                <span className={`truncate ${del?.isComplete ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                  {d.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {level.deliverables.length > 4 && (
                          <div className="text-[11px] text-muted-foreground mt-2">
                            +{level.deliverables.length - 4} more deliverables
                          </div>
                        )}
                        <Link href="/level" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#DC143C] hover:text-[#DC143C]/80 transition-colors">
                          View all deliverables
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}

                    {isLocked && (
                      <div className="mt-3 text-xs text-muted-foreground/50">
                        <span className="font-mono">{level.deliverables.length}</span> deliverables unlock at this level
                      </div>
                    )}
                  </Card>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Feed Tab ────────────────────────────────────────────────────────
function FeedTab() {
  const { state } = useApp();
  const profileQuery = trpc.profile.get.useQuery();
  const feedQuery = trpc.journey.getFeed.useQuery({ limit: 30, offset: 0 });
  const draftsQuery = trpc.journey.getDrafts.useQuery();
  const timelineQuery = trpc.journey.myTimeline.useQuery();

  const isCoach = !!profileQuery.data?.coachMode;
  const drafts = draftsQuery.data || [];
  const feed = feedQuery.data || [];
  const timeline = timelineQuery.data || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Community Feed (2/3) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold">Community Feed</h3>
          <Badge variant="outline" className="text-[10px]">
            {feed.length} posts
          </Badge>
        </div>

        {feedQuery.isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : feed.length === 0 ? (
          <Card className="p-12 text-center">
            <Zap className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <h3 className="font-display text-sm font-semibold mb-1">
              Your feed is empty
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Complete deliverables and advance your level to generate your
              first milestone posts. Connect with your cohort to see their
              journey updates here.
            </p>
          </Card>
        ) : (
          feed.map((post: any) => (
            <PostCard key={post.postId} post={post} isCoach={isCoach} />
          ))
        )}
      </div>

      {/* Right: Personal timeline + drafts (1/3) */}
      <div className="space-y-4">
        {/* Draft posts waiting for approval */}
        {drafts.length > 0 && (
          <div>
            <div className="text-[11px] font-medium text-muted-foreground uppercase
              tracking-wider mb-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#DC143C] animate-pulse" />
              Ready to post ({drafts.length})
            </div>
            <div className="space-y-2">
              {drafts.map((draft: any) => (
                <DraftPostCard key={draft.postId} post={draft} />
              ))}
            </div>
          </div>
        )}

        {/* Personal timeline */}
        <div>
          <div className="text-[11px] font-medium text-muted-foreground uppercase
            tracking-wider mb-2">My Timeline</div>
          {timeline.length === 0 ? (
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground">
                Complete deliverables and advance levels to build your business timeline.
              </p>
            </Card>
          ) : (
            <div className="relative">
              <div className="absolute left-3.5 top-4 bottom-4 w-px bg-border/60" />
              <div className="space-y-3 pl-10">
                {timeline.slice(0, 10).map((post: any) => (
                  <div key={post.postId} className="relative">
                    <div className="absolute -left-[26px] top-1.5 w-4 h-4 rounded-full
                      border-2 border-background bg-muted flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
                    </div>
                    <div className="text-xs font-medium leading-tight">{post.headline}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(post.createdAt), 'MMM d, yyyy')}
                      {post.reactionsCount > 0 && (
                        <span className="ml-2">&middot; {post.reactionsCount} reactions</span>
                      )}
                      {post.commentsCount > 0 && (
                        <span className="ml-1">&middot; {post.commentsCount} comments</span>
                      )}
                    </div>
                    {post.caption && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                        {post.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {timeline.length > 10 && (
                <button className="text-[10px] text-muted-foreground hover:text-foreground mt-2 ml-10">
                  View {timeline.length - 10} more &rarr;
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Journey Page ───────────────────────────────────────────────
export default function Journey() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">My Journey</h2>
        <p className="text-muted-foreground text-sm">
          Track your MREA progression and connect with the community.
        </p>
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="feed" className="text-xs">Feed</TabsTrigger>
          <TabsTrigger value="map" className="text-xs">My Map</TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          <FeedTab />
        </TabsContent>

        <TabsContent value="map">
          <MyMapTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
