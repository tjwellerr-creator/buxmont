/* Estimate request form (contact.html)

   Submissions go to a Zapier "Catch Hook" (Webhooks by Zapier). The Zap then
   emails the request to Jimmy, and can also log it, text him, etc.

   ZAPIER_HOOK_URL: paste the Catch Hook URL from the Zap's trigger step here,
   e.g. 'https://hooks.zapier.com/hooks/catch/1234567/abcdefg/'.
   While it is empty, submitting opens the visitor's email app instead, with
   the request filled in and addressed to FALLBACK_EMAIL.

   Fields Zapier receives (all plain text):
     first_name, last_name, full_name, phone, email, contact_preference,
     street, city, state, zip, project_address, project_type, property_type,
     budget, timeline, details, referral_source,
     subject   - ready-made email subject line
     summary   - the whole request as one formatted block for the email body
     submitted_at, page */
(function(){
  var ZAPIER_HOOK_URL = '';
  var FALLBACK_EMAIL = 'Jimmy@yeshuacm.com';
  var PHONE_HTML = '<a href="tel:+12159392519" style="color:var(--brick);">215-939-2519</a>';

  var form = document.getElementById('estimateForm');
  if(!form) return;
  var card = document.getElementById('estimateCard');
  var statusEl = document.getElementById('formStatus');
  var submitBtn = document.getElementById('estimateSubmit');
  var submitLabel = submitBtn.textContent;

  function fieldOf(el){ return el.closest('.field'); }
  function checkField(el){
    var ok = true, v = (el.value || '').trim();
    if(el.required && !v) ok = false;
    else if(el.type === 'email' && v) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    else if(el.type === 'tel' && v) ok = v.replace(/\D/g,'').length >= 10;
    else if(el.name === 'zip' && v) ok = /^\d{5}(-\d{4})?$/.test(v);
    var f = fieldOf(el); if(f) f.classList.toggle('invalid', !ok);
    return ok;
  }
  var checked = form.querySelectorAll('input[required], select[required], textarea[required], input[type=email], input[type=tel], input[name=zip]');
  checked.forEach(function(el){
    el.addEventListener('blur', function(){ if(el.value) checkField(el); });
    el.addEventListener('input', function(){ if(fieldOf(el).classList.contains('invalid')) checkField(el); });
    el.addEventListener('change', function(){ if(fieldOf(el).classList.contains('invalid')) checkField(el); });
  });

  function showStatus(msg, isError){
    statusEl.textContent = msg;
    statusEl.className = 'form-status show' + (isError ? ' error' : '');
  }
  function showDone(msg){
    if(msg) document.getElementById('estimateDoneMsg').innerHTML = msg;
    card.classList.add('sent');
    card.scrollIntoView({behavior:'smooth', block:'start'});
    document.getElementById('estimateDone').focus({preventScroll:true});
  }

  /* Collect the form into a flat object, plus the extra fields Zapier uses. */
  function collect(){
    var d = {};
    new FormData(form).forEach(function(v, k){ if(k !== 'website') d[k] = String(v).trim(); });
    var or = function(k){ return d[k] || '—'; };
    d.full_name = [d.first_name, d.last_name].filter(Boolean).join(' ');
    d.project_address = [d.street, d.city, [d.state, d.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    d.subject = 'Estimate request: ' + or('project_type') + ' – ' + d.full_name;
    d.summary = [
      'Name: ' + d.full_name,
      'Phone: ' + or('phone'),
      'Email: ' + or('email'),
      'Preferred contact: ' + or('contact_preference'),
      '',
      'Project address: ' + or('project_address'),
      'Project type: ' + or('project_type'),
      'Property type: ' + or('property_type'),
      'Budget: ' + or('budget'),
      'Timeline: ' + or('timeline'),
      'Heard about us: ' + or('referral_source'),
      '',
      'Project details:',
      or('details')
    ].join('\n');
    d.submitted_at = new Date().toLocaleString('en-US', {timeZone:'America/New_York', dateStyle:'medium', timeStyle:'short'}) + ' ET';
    d.page = location.href.split('#')[0];
    return d;
  }

  function mailtoFor(d){
    return 'mailto:' + FALLBACK_EMAIL + '?subject=' + encodeURIComponent(d.subject) + '&body=' + encodeURIComponent('New estimate request\n\n' + d.summary);
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    statusEl.className = 'form-status';
    if(form.website.value) return; // spam trap filled: silently ignore
    var firstBad = null;
    checked.forEach(function(el){ if(!checkField(el) && !firstBad) firstBad = el; });
    if(firstBad){
      showStatus('Please fix the highlighted fields and try again.', true);
      firstBad.focus();
      return;
    }
    var d = collect();

    if(!ZAPIER_HOOK_URL){
      window.location.href = mailtoFor(d);
      showDone('Your email app should open with your request filled in &mdash; just press send. If it didn&rsquo;t open, call or text ' + PHONE_HTML + ' or email <a href="mailto:' + FALLBACK_EMAIL + '" style="color:var(--brick);">' + FALLBACK_EMAIL + '</a>.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    // Form-encoded body keeps this a "simple" cross-origin request (no CORS preflight),
    // and Zapier splits it into separate fields automatically.
    fetch(ZAPIER_HOOK_URL, { method:'POST', body:new URLSearchParams(d) })
      .then(function(res){
        if(!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        showDone();
      })
      .catch(function(){
        showStatus('Sorry, your request didn’t go through. Please try again, or call/text 215-939-2519.', true);
      })
      .then(function(){ submitBtn.disabled = false; submitBtn.textContent = submitLabel; });
  });
})();
