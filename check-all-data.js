const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllData() {
  try {
    console.log('🔍 Checking all real data in database...\n');
    
    // Check users
    const users = await prisma.user.findMany({
      include: {
        venturesOwned: true,
        subscriptions: true
      }
    });
    
    console.log('👥 USERS:', users.length);
    users.forEach(user => {
      console.log(`   - ${user.id}: ${user.email} (${user.name}) - ${user.status} - ${user.level}`);
      console.log(`     Ventures: ${user.venturesOwned.length}, Subscriptions: ${user.subscriptions.length}`);
    });
    console.log('');
    
    // Check ventures
    const ventures = await prisma.venture.findMany({
      include: {
        owner: true,
        ventureProfile: true,
        ventureLegalEntity: true,
        equityFramework: true
      }
    });
    
    console.log('🚀 VENTURES:', ventures.length);
    ventures.forEach(venture => {
      console.log(`   - ${venture.id}: ${venture.name}`);
      console.log(`     Owner: ${venture.owner?.email} (${venture.owner?.name})`);
      console.log(`     Status: ${venture.status}, Region: ${venture.region}`);
      console.log(`     Profile: ${venture.ventureProfile ? 'Yes' : 'No'}`);
      console.log(`     Legal Entity: ${venture.ventureLegalEntity ? 'Yes' : 'No'}`);
      console.log(`     Equity Framework: ${venture.equityFramework ? 'Yes' : 'No'}`);
    });
    console.log('');
    
    // Check subscriptions
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: true,
        plan: true
      }
    });
    
    console.log('💳 SUBSCRIPTIONS:', subscriptions.length);
    subscriptions.forEach(sub => {
      console.log(`   - ${sub.id}: ${sub.user?.email} - ${sub.status}`);
      console.log(`     Plan: ${sub.plan?.name || 'No plan'}`);
      console.log(`     Amount: ${sub.amount || 'N/A'}`);
    });
    console.log('');
    
    // Check legal packs
    try {
      const legalPacks = await prisma.legalPack.findMany();
      console.log('📋 LEGAL PACKS:', legalPacks.length);
      legalPacks.forEach(pack => {
        console.log(`   - ${pack.id}: ${pack.name} - ${pack.status}`);
      });
    } catch (error) {
      console.log('📋 LEGAL PACKS: Model not found or no data');
    }
    console.log('');
    
    // Check meetings
    try {
      const meetings = await prisma.meeting.findMany({
        include: {
          organizer: true,
          attendees: true
        }
      });
      
      console.log('📅 MEETINGS:', meetings.length);
      meetings.forEach(meeting => {
        console.log(`   - ${meeting.id}: ${meeting.title}`);
        console.log(`     Organizer: ${meeting.organizer?.email}`);
        console.log(`     Attendees: ${meeting.attendees.length}`);
        console.log(`     Date: ${meeting.scheduledDate}`);
      });
    } catch (error) {
      console.log('📅 MEETINGS: Model not found or no data');
    }
    console.log('');
    
    // Check billing plans
    try {
      const billingPlans = await prisma.billingPlan.findMany();
      console.log('💰 BILLING PLANS:', billingPlans.length);
      billingPlans.forEach(plan => {
        console.log(`   - ${plan.id}: ${plan.name} - $${plan.price}/month`);
      });
    } catch (error) {
      console.log('💰 BILLING PLANS: Model not found or no data');
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData();
