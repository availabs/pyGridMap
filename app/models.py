from app import db

class Index(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, index=True, unique=True)
    rmm1 = db.Column(db.Integer, index=True, unique=False)
    rmm2 = db.Column(db.Integer, index=True, unique=False)
    phase = db.Column(db.Integer, index=True, unique=False)
    amp = db.Column(db.Integer, index=True, unique=False)

    def __repr__(self):
        return '<Date %r>' % (self.date)
