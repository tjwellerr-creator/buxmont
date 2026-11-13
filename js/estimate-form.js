/* Estimate request form (contact.html) */
(function(){
  /* ---------- estimate request form ----------
     FORM_ENDPOINT: set this to the URL that should receive submissions
     (e.g. a Formspree / Netlify / Zapier / custom backend endpoint). It will
     receive a multipart POST with every field plus any attached files.
     While it is empty, submitting opens the visitor's email app with the
     request pre-filled and addressed to FALLBACK_EMAIL. */
  var FORM_ENDPOINT = '';
  var FALLBACK_EMAIL = 'Jimmy@yeshuacm.com';
  var MAX_FILES = 10, MAX_FILE_MB = 10;

  var form = document.getElementById('estimateForm');
  var card = document.getElementById('estimateCard');
  var statusEl = document.getElementById('formStatus');
  var submitBtn = document.getElementById('estimateSubmit');
  var fileInput = document.getElementById('f-files');
  var fileList = document.getElementById('fileList');
  var fileDrop = document.getElementById('fileDrop');

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
  function checkFiles(){
    var files = Array.prototype.slice.call(fileInput.files || []);
    var ok = files.length <= MAX_FILES && files.every(function(f){ return f.size <= MAX_FILE_MB*1024*1024; });
    fieldOf(fileInput).classList.toggle('invalid', !ok);
    fileList.textContent = files.length ? files.length + ' file' + (files.length>1?'s':'') + ' selected: ' + files.map(function(f){return f.name;}).join(', ') : '';
    return ok;
  }
  var required = form.querySelectorAll('input[required], select[required], textarea[required], input[type=email], input[type=tel], input[name=zip]');
  required.forEach(function(el){
    el.addEventListener('blur', function(){ if(el.value) checkField(el); });
    el.addEventListener('input', function(){ if(fieldOf(el).classList.contains('invalid')) checkField(el); });
    el.addEventListener('change', function(){ if(fieldOf(el).classList.contains('invalid')) checkField(el); });
  });
  fileInput.addEventListener('change', checkFiles);
  ['dragenter','dragover'].forEach(function(t){ fileDrop.addEventListener(t, function(){ fileDrop.classList.add('drag'); }); });
  ['dragleave','drop'].forEach(function(t){ fileDrop.addEventListener(t, function(){ fileDrop.classList.remove('drag'); }); });

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
  function buildEmail(data){
    var get = function(k){ return (data.get(k) || '').toString().trim() || '—'; };
    var lines = [
      'New estimate request',
      '',
      'Name: ' + get('first_name') + ' ' + get('last_name'),
      'Phone: ' + get('phone'),
      'Email: ' + get('email'),
      'Preferred contact: ' + get('contact_preference'),
      '',
      'Project address: ' + get('street') + ', ' + get('city') + ', ' + get('state') + ' ' + get('zip'),
      'Project type: ' + get('project_type'),
      'Property type: ' + get('property_type'),
      'Budget: ' + get('budget'),
      'Timeline: ' + get('timeline'),
      'Heard about us: ' + get('referral_source'),
      '',
      'Project details:',
      get('details')
    ];
    if(fileInput.files.length) lines.push('', '(Please attach your ' + fileInput.files.length + ' photo/plan file(s) to this email before sending.)');
    var subject = 'Estimate request – ' + get('project_type') + ' – ' + get('first_name') + ' ' + get('last_name');
    return 'mailto:' + FALLBACK_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    statusEl.className = 'form-status';
    if(form.website.value) return; // spam trap filled: silently ignore
    var firstBad = null;
    required.forEach(function(el){ if(!checkField(el) && !firstBad) firstBad = el; });
    if(!checkFiles() && !firstBad) firstBad = fileInput;
    if(firstBad){
      showStatus('Please fix the highlighted fields and try again.', true);
      firstBad.focus();
      return;
    }
    var data = new FormData(form);
    data.delete('website');

    if(!FORM_ENDPOINT){
      window.location.href = buildEmail(data);
      showDone('Your email app should open with your request filled in &mdash; just press send. If it didn&rsquo;t open, call or text <a href="tel:+12159392519" style="color:var(--brick);">215-939-2519</a> or email <a href="mailto:' + FALLBACK_EMAIL + '" style="color:var(--brick);">' + FALLBACK_EMAIL + '</a>.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    fetch(FORM_ENDPOINT, { method:'POST', body:data, headers:{ 'Accept':'application/json' } })
      .then(function(res){ if(!res.ok) throw new Error(res.status); showDone(); })
      .catch(function(){
        showStatus('Sorry, something went wrong sending your request. Please try again, or call/text 215-939-2519.', true);
      })
      .then(function(){ submitBtn.disabled = false; submitBtn.textContent = 'Request My Estimate'; });
  });
})();
