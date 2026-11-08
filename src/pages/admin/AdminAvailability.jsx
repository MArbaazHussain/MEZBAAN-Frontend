import { useEffect, useState } from 'react';
import { api } from '../../api';

// Staff availability schedules manage karta hai (REQ-7.7)
export default function AdminAvailability() {
  const [services, setServices] = useState([]);
  const [listingId, setListingId] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({ startDatetime: '', endDatetime: '', availabilityStatus: 'Booked', capacityTotal: 1 });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api('/services/manage/all').then((d) => setServices(d.services)).catch((e) => setMsg({ type: 'error', text: e.message }));
  }, []);

  const loadSchedules = (id = listingId) => {
    if (!id) { setSchedules([]); return; }
    api(`/availability/service/${id}`).then(setSchedules).catch((e) => setMsg({ type: 'error', text: e.message }));
  };
  useEffect(() => { loadSchedules(); }, [listingId]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const add = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!listingId) return setMsg({ type: 'error', text: 'Select a service first.' });
    // Date input se poore din ki range: start 00:00 se end date ke agle din 00:00 tak
    const start = new Date(`${form.startDatetime}T00:00:00`);
    const end = new Date(`${form.endDatetime || form.startDatetime}T00:00:00`);
    end.setDate(end.getDate() + 1);
    try {
      await api('/availability', {
        method: 'POST',
        body: { listingId, startDatetime: start, endDatetime: end, availabilityStatus: form.availabilityStatus, capacityTotal: Number(form.capacityTotal) }
      });
      setMsg({ type: 'success', text: 'Schedule added.' });
      loadSchedules();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  };

  const changeStatus = async (s, availabilityStatus) => {
    try {
      await api(`/availability/${s._id}`, { method: 'PUT', body: { availabilityStatus } });
      loadSchedules();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  };

  const remove = async (s) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await api(`/availability/${s._id}`, { method: 'DELETE' });
      loadSchedules();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  const lastDay = (d) => { const x = new Date(d); x.setMinutes(x.getMinutes() - 1); return x; };

  return (
    <div>
      <h1>Service availability</h1>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <label>Service
          <select value={listingId} onChange={(e) => setListingId(e.target.value)}>
            <option value="">Select a service</option>
            {services.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
          </select>
        </label>
      </div>

      {listingId && (
        <>
          <form className="card" onSubmit={add}>
            <h3>Add schedule</h3>
            <div className="row-3">
              <label>From date<input type="date" required value={form.startDatetime} onChange={set('startDatetime')} /></label>
              <label>To date<input type="date" value={form.endDatetime} min={form.startDatetime} onChange={set('endDatetime')} /></label>
              <label>Status
                <select value={form.availabilityStatus} onChange={set('availabilityStatus')}>
                  <option>Available</option>
                  <option>Booked</option>
                  <option>Maintenance</option>
                </select>
              </label>
            </div>
            <button className="btn btn-dark">Add</button>
          </form>

          <div className="card">
            <h3>Schedules</h3>
            {schedules.length === 0 && <p className="muted">No schedules. Customers will see "Unconfirmed" for this service.</p>}
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>From</th><th>To</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s._id}>
                      <td>{fmt(s.startDatetime)}</td>
                      <td>{fmt(lastDay(s.endDatetime))}</td>
                      <td>
                        <select value={s.availabilityStatus} onChange={(e) => changeStatus(s, e.target.value)}>
                          <option>Available</option>
                          <option>Booked</option>
                          <option>Maintenance</option>
                        </select>
                      </td>
                      <td><button className="btn-link text-danger" onClick={() => remove(s)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
