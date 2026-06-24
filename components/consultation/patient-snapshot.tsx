type PatientSnapshotData = {
  name: string
  email: string
  phone?: string | null
  patientProfile?: {
    age?: number | null
    birthDate?: Date | string | null
    phone?: string | null
    gender?: string | null
    address?: string | null
  } | null
}

function value(text?: string | number | null) {
  return text || "Belum diisi"
}

export function PatientSnapshot({ patient }: { patient: PatientSnapshotData }) {
  const profile = patient.patientProfile

  return (
    <section className="rounded-md border bg-card p-5">
      <p className="text-sm text-muted-foreground">Snapshot Pasien</p>
      <h2 className="mt-1 text-lg font-semibold">{patient.name}</h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Email</dt>
          <dd>{value(patient.email)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">WhatsApp</dt>
          <dd>{value(profile?.phone ?? patient.phone)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Usia</dt>
          <dd>{value(profile?.age)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Jenis kelamin</dt>
          <dd>{profile?.gender === "MALE" ? "Laki-laki" : profile?.gender === "FEMALE" ? "Perempuan" : "Belum diisi"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Alamat</dt>
          <dd>{value(profile?.address)}</dd>
        </div>
      </dl>
    </section>
  )
}
