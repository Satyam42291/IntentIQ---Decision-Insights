/**
 * Seed 20 sample decision logs and their reviews as a human would write in real life.
 * Uses the same repository APIs so data is stored exactly like user-created entries.
 */

import { decisionRepository } from '@/lib/db/repositories/decisionRepository';
import { reviewRepository } from '@/lib/db/repositories/reviewRepository';

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(12, 0, 0, 0);
  return d;
}

type DecisionCreate = Parameters<typeof decisionRepository.create>[0];
type ReviewCreateWithoutId = Omit<Parameters<typeof reviewRepository.create>[0], 'decision_id'>;

export async function seedSampleDecisions(): Promise<void> {
  const samples: Array<{ decision: DecisionCreate; review: ReviewCreateWithoutId }> = [
    {
      decision: {
        title: 'Accepted the new job offer at the product company',
        reasoning:
          'Better growth, clearer role, and the team seemed more aligned with how I like to work. Pay was only a small bump but the learning and stability mattered more. I weighed it for about two weeks.',
        confidence: 72,
        decision_type: 'work',
        importance: 'high',
        decision_speed: 'slow',
        decision_drivers: ['opportunity'],
        expected_outcome:
          'I’ll ramp up in 2–3 months, contribute to the roadmap by Q2, and feel less scattered than in my current role.',
        review_date: daysAgo(45),
      },
      review: {
        expectation_comparison: 'slightly_better',
        decision_quality: 'very_thoughtful',
        surprise_score: 15,
        what_happened:
          'Onboarding was smoother than I expected. I was given real ownership by month 2 and the culture fit is good. Only downside is more meetings than I hoped.',
        learning_note:
          'When the process is slow and deliberate, my work decisions tend to pan out. I should keep blocking time for big career choices.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(30),
      },
    },
    {
      decision: {
        title: 'Moved to the new apartment closer to the office',
        reasoning:
          'Commute was eating 2+ hours a day. New place is 20 min by bike, a bit more rent but I’ll save on transport and stress. Landlord seemed decent, lease was standard.',
        confidence: 65,
        decision_type: 'personal',
        importance: 'high',
        decision_speed: 'moderate',
        decision_drivers: ['logic'],
        expected_outcome:
          'Shorter commute, more time for exercise and cooking. Slightly tighter on space but manageable.',
        review_date: daysAgo(60),
      },
      review: {
        expectation_comparison: 'as_expected',
        decision_quality: 'reasonable',
        surprise_score: 25,
        what_happened:
          'Commute is down to 20 mins, I’m actually biking most days. The place is a bit small when I have guests but day-to-day it’s fine. Rent increase was as expected.',
        learning_note:
          'Trade-offs I wrote down (cost vs time) matched reality. Next time I’ll also write down “worst case” so I’m not surprised by small downsides.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(25),
      },
    },
    {
      decision: {
        title: 'Put a chunk of savings into the new index fund',
        reasoning:
          'I had been sitting in cash for a while. Read a couple of articles and talked to one friend who’s been in the market. Wanted to start simple with a broad index. Didn’t want to overthink it.',
        confidence: 55,
        decision_type: 'finance',
        importance: 'medium',
        decision_speed: 'quick',
        decision_drivers: ['opportunity'],
        expected_outcome:
          'Long-term it should track the market. I’m okay with short-term dips. Goal is to beat inflation over 5+ years.',
        review_date: daysAgo(90),
      },
      review: {
        expectation_comparison: 'slightly_worse',
        decision_quality: 'acceptable',
        surprise_score: 40,
        what_happened:
          'Market dipped not long after I bought. I didn’t sell but it was uncomfortable. Now it’s roughly back to where I started. I put in a bit more than I was truly comfortable with.',
        learning_note:
          'I was a bit overconfident on “I can handle volatility.” Next time I’ll only invest the amount I’m genuinely fine not touching for 5+ years, and maybe dollar-cost average in.',
        would_repeat: 'unsure',
        reviewed_at: daysAgo(14),
      },
    },
    {
      decision: {
        title: 'Started waking at 6am to go to the gym before work',
        reasoning:
          'I was tired of “I’ll go after work” and never going. Felt like I had to force a habit. Picked 6am so it’s non-negotiable and doesn’t depend on how the day goes.',
        confidence: 48,
        decision_type: 'health',
        importance: 'medium',
        decision_speed: 'quick',
        decision_drivers: ['fear', 'emotion'],
        expected_outcome:
          'First 2 weeks will be rough, then it becomes routine. I’ll get 3–4 sessions per week and feel better overall.',
        review_date: daysAgo(21),
      },
      review: {
        expectation_comparison: 'much_better',
        decision_quality: 'emotional',
        surprise_score: 55,
        what_happened:
          'First week was brutal. By week 3 I stopped dreading the alarm. Now I’m at 4x a week and I actually miss it when I skip. Energy and mood are noticeably better. Didn’t expect it to stick.',
        learning_note:
          'Sometimes the “emotional” or reactive decision (fear of staying stuck) can work if the system is simple. The key was making it one decision (6am) instead of deciding every day.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(5),
      },
    },
    {
      decision: {
        title: 'Said no to leading the extra side project at work',
        reasoning:
          'I was already at capacity and the PM said it was optional. I didn\'t want to half-do another thing. Said no clearly and offered to help in Q3 if priorities shifted.',
        confidence: 70,
        decision_type: 'work',
        importance: 'medium',
        decision_speed: 'moderate',
        decision_drivers: ['logic'],
        expected_outcome: 'No resentment, and I keep focus on the main roadmap. Maybe they ask again later.',
        review_date: daysAgo(30),
      },
      review: {
        expectation_comparison: 'as_expected',
        decision_quality: 'reasonable',
        surprise_score: 20,
        what_happened: 'They were fine with it. The project got handed to someone else and I stayed on my commitments. No follow-up pressure.',
        learning_note: 'Saying no with a clear reason and an optional "later" works better than vague maybes. I\'ll keep using that pattern.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(18),
      },
    },
    {
      decision: {
        title: 'Stopped investing time in a friendship that felt one-sided',
        reasoning:
          'I was always the one reaching out and making plans. After a few cancelled meetups I decided to step back and see if they\'d initiate. It felt sad but necessary.',
        confidence: 52,
        decision_type: 'personal',
        importance: 'high',
        decision_speed: 'slow',
        decision_drivers: ['fear', 'emotion'],
        expected_outcome: 'Either they reach out and we rebalance, or the friendship fades and I make space for better ones.',
        review_date: daysAgo(50),
      },
      review: {
        expectation_comparison: 'slightly_better',
        decision_quality: 'emotional',
        surprise_score: 35,
        what_happened: 'They did reach out once after about a month. We met once; it was okay. I\'ve since put more energy into two other friendships and feel less drained.',
        learning_note: 'Stepping back wasn\'t punishment—it gave me data. I\'m glad I didn\'t blow up or send a big message; just changing my behavior was enough.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(22),
      },
    },
    {
      decision: {
        title: 'Switched my emergency fund to a high-yield savings account',
        reasoning:
          'My bank was paying almost nothing. I compared a few options and moved 6 months of expenses to a well-rated online bank. Took an hour to set up.',
        confidence: 78,
        decision_type: 'finance',
        importance: 'medium',
        decision_speed: 'moderate',
        decision_drivers: ['logic'],
        expected_outcome: 'Same safety, better interest. I\'ll see a small but real gain over a year.',
        review_date: daysAgo(90),
      },
      review: {
        expectation_comparison: 'as_expected',
        decision_quality: 'reasonable',
        surprise_score: 10,
        what_happened: 'Rates went up a bit more after I moved. I\'m earning noticeably more than before with no extra effort. No downsides so far.',
        learning_note: 'Low-effort, low-risk financial tweaks are worth doing. I\'ll review other "set and forget" accounts once a year.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(60),
      },
    },
    {
      decision: {
        title: 'Cut caffeine after 2pm to fix my sleep',
        reasoning:
          'I was struggling to fall asleep and suspected afternoon coffee. Read that caffeine has a long half-life. Decided to try a hard cutoff at 2pm for two weeks.',
        confidence: 58,
        decision_type: 'health',
        importance: 'medium',
        decision_speed: 'moderate',
        decision_drivers: ['logic'],
        expected_outcome: 'Faster sleep onset and more consistent wake time. Maybe less afternoon jitter too.',
        review_date: daysAgo(21),
      },
      review: {
        expectation_comparison: 'slightly_better',
        decision_quality: 'acceptable',
        surprise_score: 30,
        what_happened: 'Sleep improved within about a week. I also realized I was drinking less overall because I had a clear rule. Energy is more even.',
        learning_note: 'Simple rules work better than "I\'ll try to cut back." The 2pm rule was easy to follow and had a clear signal.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(10),
      },
    },
    {
      decision: {
        title: 'Volunteered to lead the neighborhood cleanup event',
        reasoning:
          'Nobody had stepped up and I had a free Saturday. I\'ve organized small things before. Thought it would be good for the community and maybe help me meet more neighbors.',
        confidence: 62,
        decision_type: 'other',
        importance: 'low',
        decision_speed: 'quick',
        decision_drivers: ['opportunity'],
        expected_outcome: 'A decent turnout, a cleaner block, and a few new faces. Some extra admin work for me.',
        review_date: daysAgo(14),
      },
      review: {
        expectation_comparison: 'much_better',
        decision_quality: 'reasonable',
        surprise_score: 45,
        what_happened: 'Way more people showed up than I expected. We got the whole block done by noon. Two neighbors offered to co-lead next time. Felt really good.',
        learning_note: 'Small "yes" to community stuff can have big payoff. I\'ll say yes to one thing like this per season.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(5),
      },
    },
    {
      decision: {
        title: 'Asked for a raise during my performance review',
        reasoning:
          'I had data on market rates and had taken on more scope. Prepared a short doc and rehearsed. Didn\'t want to leave it unsaid and regret it.',
        confidence: 55,
        decision_type: 'work',
        importance: 'high',
        decision_speed: 'slow',
        decision_drivers: ['logic'],
        expected_outcome: 'Best case: raise. Worst case: clear no or "later," but I\'ll have tried and have more information.',
        review_date: daysAgo(60),
      },
      review: {
        expectation_comparison: 'slightly_worse',
        decision_quality: 'very_thoughtful',
        surprise_score: 40,
        what_happened: 'They said they\'d revisit in 6 months and tied it to budget. No raise now. I was disappointed but the conversation was professional.',
        learning_note: 'I\'m glad I asked—no regret. Next time I\'ll ask earlier in the cycle and maybe tie it to a specific milestone or market data even more clearly.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(45),
      },
    },
    {
      decision: {
        title: 'Bought a used car instead of a new one',
        reasoning:
          'New cars lose value fast. I found a 3-year-old model with one owner and full service history. Test drove it and had a mechanic check it. Price was about 60% of new.',
        confidence: 68,
        decision_type: 'personal',
        importance: 'high',
        decision_speed: 'moderate',
        decision_drivers: ['logic'],
        expected_outcome: 'Reliable transport for 5+ years without the new-car premium. Slight risk of repairs but the history looked solid.',
        review_date: daysAgo(120),
      },
      review: {
        expectation_comparison: 'as_expected',
        decision_quality: 'reasonable',
        surprise_score: 22,
        what_happened: 'No major issues so far. One small repair under warranty. Fuel and insurance are as expected. I\'m happy with the choice.',
        learning_note: 'Doing homework on history and a pre-purchase check paid off. I\'d do the same again for big purchases.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(90),
      },
    },
    {
      decision: {
        title: 'Paid off the smaller credit card first (snowball method)',
        reasoning:
          'I had two cards. The smaller one had a lower balance but higher rate. I\'d read that knocking out the small one first can feel motivating. Wanted to try it.',
        confidence: 60,
        decision_type: 'finance',
        importance: 'medium',
        decision_speed: 'moderate',
        decision_drivers: ['logic'],
        expected_outcome: 'One card at zero in a few months, then I roll that payment into the other. Psychologically easier to stick with.',
        review_date: daysAgo(90),
      },
      review: {
        expectation_comparison: 'slightly_better',
        decision_quality: 'acceptable',
        surprise_score: 18,
        what_happened: 'Paid off the first card on schedule. The "win" did help—I\'m now attacking the second one and on track.',
        learning_note: 'Behavioral approach worked for me. The math said pay the higher rate first, but the snowball kept me consistent.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(50),
      },
    },
    {
      decision: {
        title: 'Tried a strict 10pm–6am sleep schedule for two weeks',
        reasoning:
          'I was all over the place with bedtimes. Read about sleep consistency and decided to force the same window for two weeks to "reset."',
        confidence: 45,
        decision_type: 'health',
        importance: 'medium',
        decision_speed: 'quick',
        decision_drivers: ['fear', 'emotion'],
        expected_outcome: 'More consistent sleep and better energy. Maybe harder at first but then it would stick.',
        review_date: daysAgo(21),
      },
      review: {
        expectation_comparison: 'much_worse',
        decision_quality: 'rushed',
        surprise_score: 60,
        what_happened: 'I couldn\'t fall asleep at 10 on several nights and then lay there stressed. After a week I gave up. Felt worse than before.',
        learning_note: 'Going from chaotic to rigid in one step was too much. Next time I\'ll shift by 15–30 minutes per week instead of a hard rule.',
        would_repeat: 'no',
        reviewed_at: daysAgo(14),
      },
    },
    {
      decision: {
        title: 'Took the fully remote role over the hybrid one',
        reasoning:
          'The hybrid role was at a bigger name but required 2 days in. The remote one was smaller company, same pay, full remote. I value flexibility and didn\'t want to move or commute.',
        confidence: 72,
        decision_type: 'work',
        importance: 'high',
        decision_speed: 'slow',
        decision_drivers: ['logic'],
        expected_outcome: 'Better work-life fit, no commute. Slightly less "brand" on the resume but I\'ll trade that for daily quality of life.',
        review_date: daysAgo(90),
      },
      review: {
        expectation_comparison: 'much_better',
        decision_quality: 'very_thoughtful',
        surprise_score: 20,
        what_happened: 'The team is great and I\'m more productive at home. I\'ve also been able to travel and work, which I didn\'t fully factor in. No regrets.',
        learning_note: 'When two options are close on paper, prioritizing daily experience over resume optics was the right call for me.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(60),
      },
    },
    {
      decision: {
        title: 'Skipped the big family reunion this year',
        reasoning:
          'It\'s always stressful and I often leave feeling drained. This year I had a work deadline and used it as a reason to bow out. Felt guilty but also relieved.',
        confidence: 48,
        decision_type: 'personal',
        importance: 'medium',
        decision_speed: 'moderate',
        decision_drivers: ['fear', 'emotion'],
        expected_outcome: 'Some family will be upset. I\'ll catch up with a few people separately. Less drama and more rest for me.',
        review_date: daysAgo(45),
      },
      review: {
        expectation_comparison: 'slightly_worse',
        decision_quality: 'emotional',
        surprise_score: 35,
        what_happened: 'Two relatives did make comments. I felt bad for a bit but the deadline was real and I did need the rest. Mixed feelings overall.',
        learning_note: 'I protected my energy but at a relationship cost. Next time I might go for one day instead of all or none, so I show up without burning out.',
        would_repeat: 'unsure',
        reviewed_at: daysAgo(30),
      },
    },
    {
      decision: {
        title: 'Opened a 529 college savings plan for my niece',
        reasoning:
          'My sister mentioned she was worried about college costs. I\'m in a position to help a bit. Researched 529s and opened one in her state, with her as beneficiary. Plan to contribute monthly.',
        confidence: 75,
        decision_type: 'finance',
        importance: 'medium',
        decision_speed: 'moderate',
        decision_drivers: ['opportunity'],
        expected_outcome: 'Tax-advantaged growth over 10+ years. She\'ll have a meaningful start when she\'s 18. I can afford the amount I set.',
        review_date: daysAgo(365),
      },
      review: {
        expectation_comparison: 'as_expected',
        decision_quality: 'reasonable',
        surprise_score: 12,
        what_happened: 'Setup was smooth. I\'ve been contributing on autopilot. My sister was really touched. No surprises so far.',
        learning_note: 'Setting up the system once and automating made it easy to follow through. I\'ll do the same for other long-term goals.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(180),
      },
    },
    {
      decision: {
        title: 'Started seeing a therapist every two weeks',
        reasoning:
          'I\'d been carrying a lot of stress and it was affecting sleep and focus. A friend had had a good experience with therapy. I found someone in-network and booked a session.',
        confidence: 50,
        decision_type: 'health',
        importance: 'high',
        decision_speed: 'moderate',
        decision_drivers: ['fear', 'emotion'],
        expected_outcome: 'A space to talk through things and maybe get some strategies. Not sure how long I\'ll go but willing to try 3 months.',
        review_date: daysAgo(90),
      },
      review: {
        expectation_comparison: 'much_better',
        decision_quality: 'reasonable',
        surprise_score: 50,
        what_happened: 'It\'s been really helpful. I\'ve learned a few concrete tools and feel less alone with the stress. I\'m extending beyond 3 months.',
        learning_note: 'I was nervous it wouldn\'t "work." Actually showing up and being honest was most of it. Glad I didn\'t wait longer.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(60),
      },
    },
    {
      decision: {
        title: 'Said yes to mentoring a junior developer on the team',
        reasoning:
          'My lead asked if I\'d pair with the new hire a few hours a week. I\'ve never formally mentored but I like teaching. Said yes and blocked time on my calendar.',
        confidence: 65,
        decision_type: 'work',
        importance: 'low',
        decision_speed: 'quick',
        decision_drivers: ['opportunity'],
        expected_outcome: 'They get up to speed faster; I get a bit less focus time but some variety. Might be good for my growth too.',
        review_date: daysAgo(60),
      },
      review: {
        expectation_comparison: 'slightly_better',
        decision_quality: 'reasonable',
        surprise_score: 25,
        what_happened: 'They\'re doing well and ask good questions. I\'ve had to explain things clearly which improved my own understanding. No real downside.',
        learning_note: 'Mentoring is a two-way learning loop. I\'ll keep saying yes to one mentee at a time when I have capacity.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(40),
      },
    },
    {
      decision: {
        title: 'Requested a transfer off my manager\'s team',
        reasoning:
          'The environment had become toxic—micromanagement, blame, no support. I\'d tried to address it and got nowhere. HR said there was an opening on another team. I applied and was honest about why.',
        confidence: 58,
        decision_type: 'work',
        importance: 'high',
        decision_speed: 'slow',
        decision_drivers: ['external_pressure'],
        expected_outcome: 'Either I get the transfer and a fresh start, or I don\'t and I have a clearer signal to look elsewhere. Either way I\'m not staying in the same setup.',
        review_date: daysAgo(45),
      },
      review: {
        expectation_comparison: 'much_better',
        decision_quality: 'acceptable',
        surprise_score: 40,
        what_happened: 'I got the transfer. New manager is supportive and the work is interesting. My stress dropped a lot. Best decision I made this year.',
        learning_note: 'Leaving a bad situation doesn\'t have to mean leaving the company. Internal moves are underused. I\'ll advocate for myself earlier next time.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(25),
      },
    },
    {
      decision: {
        title: 'Adopted a dog from the shelter',
        reasoning:
          'I\'d wanted a dog for years and finally had a stable schedule and space. Met a few dogs and connected with one. Read up on adoption and committed to the first month being an adjustment.',
        confidence: 62,
        decision_type: 'personal',
        importance: 'high',
        decision_speed: 'slow',
        decision_drivers: ['opportunity'],
        expected_outcome: 'A lot of work at first—training, routine, vet. Long term: companionship and a reason to get outside. Worth the trade-off.',
        review_date: daysAgo(60),
      },
      review: {
        expectation_comparison: 'as_expected',
        decision_quality: 'reasonable',
        surprise_score: 28,
        what_happened: 'First few weeks were exhausting. Now we have a routine and I can\'t imagine not having her. She\'s helped my mood and forced me to take breaks.',
        learning_note: 'Big lifestyle decisions are hard at first by design. Committing to a "review after 60 days" helped me push through the tough early phase.',
        would_repeat: 'yes',
        reviewed_at: daysAgo(35),
      },
    },
  ];

  for (const { decision, review } of samples) {
    const decisionId = await decisionRepository.create(decision);
    await reviewRepository.create({
      ...review,
      decision_id: String(decisionId),
      reviewed_at: review.reviewed_at ?? new Date(),
    });
  }
}

/** @deprecated Use seedSampleDecisions (seeds 20). Kept for backward compatibility. */
export const seedFourSampleDecisions = seedSampleDecisions;
