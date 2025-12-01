from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Database config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///election_candidates.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

db = SQLAlchemy(app)

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database Models
class County(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Constituency(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    county_id = db.Column(db.Integer, db.ForeignKey('county.id'), nullable=False)
    county = db.relationship('County', backref='constituencies')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Ward(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    constituency_id = db.Column(db.Integer, db.ForeignKey('constituency.id'), nullable=False)
    constituency = db.relationship('Constituency', backref='wards')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Candidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    party = db.Column(db.String(50), nullable=False)
    position = db.Column(db.String(20), nullable=False)  # presidential, governor, senator, woman_rep, mp, mca
    county_id = db.Column(db.Integer, db.ForeignKey('county.id'), nullable=True)
    constituency_id = db.Column(db.Integer, db.ForeignKey('constituency.id'), nullable=True)
    ward_id = db.Column(db.Integer, db.ForeignKey('ward.id'), nullable=True)
    image_url = db.Column(db.String(200))
    county = db.relationship('County', backref='candidates')
    constituency = db.relationship('Constituency')
    ward = db.relationship('Ward')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def save_image(file):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        return f"/static/uploads/{unique_filename}"
    return None

@app.route('/upload-candidate', methods=['POST'])
def upload_candidate():
    try:
        data = request.form
        file = request.files.get('image')
        
        candidate = Candidate(
            name=data['name'],
            party=data['party'],
            position=data['position'],
            county_id=int(data['county_id']) if data.get('county_id') else None,
            constituency_id=int(data['constituency_id']) if data.get('constituency_id') else None,
            ward_id=int(data['ward_id']) if data.get('ward_id') else None,
            image_url=save_image(file) if file else None
        )
        
        db.session.add(candidate)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Candidate uploaded successfully",
            "candidate_id": candidate.id
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/counties', methods=['GET'])
def get_counties():
    counties = County.query.all()
    return jsonify({
        "success": True,
        "counties": [{"id": c.id, "name": c.name} for c in counties]
    })

@app.route('/constituencies/<int:county_id>', methods=['GET'])
def get_constituencies(county_id):
    constituencies = Constituency.query.filter_by(county_id=county_id).all()
    return jsonify({
        "success": True,
        "constituencies": [{"id": c.id, "name": c.name} for c in constituencies]
    })

@app.route('/wards/<int:constituency_id>', methods=['GET'])
def get_wards(constituency_id):
    wards = Ward.query.filter_by(constituency_id=constituency_id).all()
    return jsonify({
        "success": True,
        "wards": [{"id": w.id, "name": w.name} for w in wards]
    })

@app.route('/fetch/<county>/<sub_county>/<ward>', methods=['GET'])
def fetch_candidates(county, sub_county, ward):
    try:
        # Find county, constituency (sub_county), ward
        county_obj = County.query.filter_by(name=county.title()).first()
        constituency_obj = Constituency.query.filter_by(
            name=sub_county.title(), 
            county_id=county_obj.id if county_obj else None
        ).first()
        ward_obj = Ward.query.filter_by(
            name=ward.title(),
            constituency_id=constituency_obj.id if constituency_obj else None
        ).first()

        # Get candidates by hierarchy
        candidates = {
            "presidential": [],
            "governor": [],
            "senator": [],
            "woman_rep": [],
            "mp": [],
            "mca": []
        }

        # Presidential (national level)
        candidates["presidential"] = Candidate.query.filter_by(position='presidential').all()
        
        # County level
        if county_obj:
            county_candidates = Candidate.query.filter_by(county_id=county_obj.id).all()
            for cand in county_candidates:
                if cand.position == 'governor':
                    candidates["governor"].append(cand)
                elif cand.position == 'senator':
                    candidates["senator"].append(cand)
                elif cand.position == 'woman_rep':
                    candidates["woman_rep"].append(cand)
        
        # Constituency level (MP)
        if constituency_obj:
            mp_candidates = Candidate.query.filter_by(
                position='mp', 
                constituency_id=constituency_obj.id
            ).all()
            candidates["mp"] = mp_candidates
        
        # Ward level (MCA)
        if ward_obj:
            mca_candidates = Candidate.query.filter_by(
                ward_id=ward_obj.id,
                position='mca'
            ).all()
            candidates["mca"] = mca_candidates

        # Format response in correct order
        ordered_candidates = []
        position_order = ["presidential", "governor", "senator", "woman_rep", "mp", "mca"]
        
        for position in position_order:
            if candidates[position]:
                ordered_candidates.append({
                    "position": position.replace("_", " ").title(),
                    "candidates": [{
                        "id": c.id,
                        "name": c.name,
                        "party": c.party,
                        "image": request.host_url + c.image_url if c.image_url else None
                    } for c in candidates[position]]
                })

        return jsonify({
            "success": True,
            "county": county,
            "sub_county": sub_county,
            "ward": ward,
            "candidates": ordered_candidates
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/admin/candidates', methods=['GET'])
def list_candidates():
    candidates = Candidate.query.all()
    return jsonify({
        "success": True,
        "candidates": [{
            "id": c.id,
            "name": c.name,
            "party": c.party,
            "position": c.position,
            "county": c.county.name if c.county else None,
            "image_url": request.host_url + c.image_url if c.image_url else None
        } for c in candidates]
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
