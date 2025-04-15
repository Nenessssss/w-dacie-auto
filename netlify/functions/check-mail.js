
const { createClient } = require('@supabase/supabase-js');
const emailjs = require('@emailjs/nodejs');

exports.handler = async function () {
  const supabase = createClient(
    'https://tcrcppzppdyvwbinsoot.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcmNwcHpwcGR5dndiaW5zb290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMTM3MDMsImV4cCI6MjA1OTY4OTcwM30.zcVankh3jglMDCc6o27H1HtELpLkqtEKJyPA8XHdBwM'
  );

  emailjs.init('md1j0JK-DCLCVkWHI');

  const { data, error } = await supabase.from('formularioze').select('*');
  if (error) return { statusCode: 500, body: 'Supabase error' };

  const today = new Date();
  const todayPlus90 = new Date(today.setDate(today.getDate() + 90));
  const matchDate = todayPlus90.toLocaleDateString('pl-PL').replace(/\./g, '-');

  const matching = data.filter(row => row.data === matchDate && row.mailed !== true);

  for (const row of matching) {
    const body = `Hej (${row.kategoria}), twoje (${row.nazwa} + ${row.vt}) wychodzi z daty za 90 dni. Stockkeeper poinformowany.`;

    const tech1 = row.tech1;
    const tech2 = row.tech2;
    const stock = row.stockkeeper;

    if (tech1) {
      await emailjs.send('service_r96erw4', 'template_uxgyy9a', {
        to_email: tech1,
        name: 'W Dacie',
        email: 'noreply@wdacie.pl',
        body,
      });
    }

    if (tech2) {
      await emailjs.send('service_r96erw4', 'template_uxgyy9a', {
        to_email: tech2,
        name: 'W Dacie',
        email: 'noreply@wdacie.pl',
        body,
      });
    }

    if (stock) {
      await emailjs.send('service_r96erw4', 'template_uxgyy9a', {
        to_email: stock,
        name: 'W Dacie',
        email: 'noreply@wdacie.pl',
        body: `Hej tu van (${row.kategoria}), nasz (${row.nazwa} + ${row.vt}) wychodzi z daty za 90 dni. Zamów nam nowe narzędzie. Dziękujemy.`,
      });
    }

    await supabase.from('formularioze').update({ mailed: true }).eq('id', row.id);
  }

  return {
    statusCode: 200,
    body: `Maile wysłane: ${matching.length}`,
  };
};
