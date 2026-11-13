/* Estimate request form (contact.html)

   Submissions are emailed to Jimmy through FormSubmit (formsubmit.co), a free
   form-to-email service. No account is needed: the very first submission
   sends an activation email to the address below, and once Jimmy clicks
   "Activate Form" in it, every request arrives in his inbox as a table.

   FORMSUBMIT_TO: the address (or, after activation, the random alias
   FormSubmit gives you) that receives the requests. Set it to '' to fall back
   to opening the visitor's email app with the request filled in. */
(function(){
  var FORMSUBMIT_TO = 'Jimmy@yeshuacm.com';
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

  /* Collect the form into a flat object, plus subject/summary helpers. */
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

  /* What Jimmy sees in the email: labeled rows, in this order. */
  function formSubmitPayload(d){
    var p = new FormData();
    var row = function(label, v){ p.append(label, v || '—'); };
    row('Name', d.full_name);
    row('Phone', d.phone);
    p.append('email', d.email);                // FormSubmit uses this as Reply-To
    row('Preferred contact', d.contact_preference);
    row('Project address', d.project_address);
    row('Project type', d.project_type);
    row('Property type', d.property_type);
    row('Budget', d.budget);
    row('Timeline', d.timeline);
    row('Project details', d.details);
    row('Heard about us', d.referral_source);
    row('Submitted', d.submitted_at);
    p.append('_subject', d.subject);
    p.append('_replyto', d.email);
    p.append('_template', 'table');
    p.append('_captcha', 'false');
    p.append('_autoresponse', 'Thanks for reaching out to Yeshua Drafting and Construction Management. We received your estimate request and Jimmy will be in touch within one business day. Need us sooner? Call or text 215-939-2519.');
    return p;
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

    if(!FORMSUBMIT_TO){
      window.location.href = mailtoFor(d);
      showDone('Your email app should open with your request filled in &mdash; just press send. If it didn&rsquo;t open, call or text ' + PHONE_HTML + ' or email <a href="mailto:' + FALLBACK_EMAIL + '" style="color:var(--brick);">' + FALLBACK_EMAIL + '</a>.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    fetch('https://formsubmit.co/ajax/' + FORMSUBMIT_TO, {
      method:'POST',
      headers:{ 'Accept':'application/json' },
      body:formSubmitPayload(d)
    })
      .then(function(res){ return res.json().catch(function(){ return {}; }).then(function(j){ return {ok:res.ok, j:j}; }); })
      .then(function(r){
        if(!r.ok || String(r.j.success) !== 'true') throw new Error(r.j.message || 'send failed');
        form.reset();
        showDone();
      })
      .catch(function(){
        showStatus('Sorry, your request didn’t go through. Please try again, or call/text 215-939-2519.', true);
      })
      .then(function(){ submitBtn.disabled = false; submitBtn.textContent = submitLabel; });
  });
})();
